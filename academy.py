"""
CryptoCoach Academy: Duolingo-style lessons, quizzes, XP and streaks.
The lesson content lives in lessons.py. Progress is stored in the
lesson_progress table in Supabase.
"""
from datetime import timedelta

import pandas as pd
import streamlit as st
from sqlalchemy import text

from lessons import UNITS, all_lessons

PASS_RATIO = 2 / 3  # at least 2 correct answers out of 3 to pass a lesson


# ---------- Database ----------

def get_progress(conn, email):
    """Completed lessons for this user, as {lesson_id: {"score": .., "xp": ..}}."""
    rows = conn.query(
        "select lesson_id, score, xp from lesson_progress where email = :email;",
        params={"email": email}, ttl=0,
    )
    return {row["lesson_id"]: {"score": int(row["score"]), "xp": int(row["xp"])}
            for _, row in rows.iterrows()}


def save_progress(conn, email, lesson_id, score, xp):
    """Save a finished lesson. If it was already done, keep the best result."""
    with conn.session as s:
        s.execute(text("""
            insert into lesson_progress (email, lesson_id, score, xp)
            values (:email, :lesson_id, :score, :xp)
            on conflict (email, lesson_id) do update set
                score = greatest(lesson_progress.score, excluded.score),
                xp = greatest(lesson_progress.xp, excluded.xp),
                completed_at = now();
        """), {"email": email, "lesson_id": lesson_id, "score": score, "xp": xp})
        s.commit()


def get_streak(conn, email):
    """Number of consecutive days (up to today) with a lesson or a trade."""
    rows = conn.query("""
        select completed_at as at from lesson_progress where email = :email
        union all
        select created_at as at from transactions where email = :email;
    """, params={"email": email}, ttl=0)
    if rows.empty:
        return 0
    days = set(pd.to_datetime(rows["at"], utc=True).dt.tz_convert("Europe/Paris").dt.date)
    today = pd.Timestamp.now(tz="Europe/Paris").date()
    day = today if today in days else today - timedelta(days=1)
    streak = 0
    while day in days:
        streak += 1
        day -= timedelta(days=1)
    return streak


# ---------- Lesson state (kept in session_state) ----------

def start_lesson(lesson_id):
    # Forget the answers of a previous attempt at this lesson
    for key in [k for k in st.session_state if str(k).startswith(f"answer-{lesson_id}-")]:
        del st.session_state[key]
    st.session_state.lesson = {"id": lesson_id, "step": "cards", "card": 0,
                               "q": 0, "correct": 0, "checked": False, "saved": False}


def quit_lesson():
    st.session_state.pop("lesson", None)


def next_card(lesson):
    state = st.session_state.lesson
    if state["card"] + 1 < len(lesson["cards"]):
        state["card"] += 1
    else:
        state["step"] = "quiz"


def check_answer(question, key):
    state = st.session_state.lesson
    state["checked"] = True
    state["last_ok"] = st.session_state.get(key) == question["choices"][question["answer"]]
    if state["last_ok"]:
        state["correct"] += 1


def next_question(lesson):
    state = st.session_state.lesson
    state["checked"] = False
    if state["q"] + 1 < len(lesson["questions"]):
        state["q"] += 1
    else:
        state["step"] = "done"


# ---------- Screens ----------

def render_header(conn, email, progress):
    lessons = all_lessons()
    total_xp = sum(p["xp"] for p in progress.values())
    streak = get_streak(conn, email)
    done = sum(1 for lesson in lessons if lesson["id"] in progress)

    c1, c2, c3 = st.columns(3)
    c1.metric("⭐ XP", total_xp)
    c2.metric("🔥 Streak", f"{streak} day{'s' if streak != 1 else ''}")
    c3.metric("📘 Lessons", f"{done} / {len(lessons)}")
    st.progress(done / len(lessons))


def render_path(progress):
    lessons = all_lessons()
    # A lesson is unlocked if it is the first one, or if the previous one is done
    unlocked = {lessons[0]["id"]}
    for previous, lesson in zip(lessons, lessons[1:]):
        if previous["id"] in progress:
            unlocked.add(lesson["id"])

    for unit in UNITS:
        st.markdown(f"#### {unit['title']}")
        for lesson in unit["lessons"]:
            col_label, col_button = st.columns([4, 1])
            if lesson["id"] in progress:
                result = progress[lesson["id"]]
                col_label.markdown(f"✅ **{lesson['title']}** · {result['score']}/{len(lesson['questions'])} · +{result['xp']} XP")
                col_button.button("Replay", key=f"replay-{lesson['id']}",
                                  on_click=start_lesson, args=(lesson["id"],))
            elif lesson["id"] in unlocked:
                col_label.markdown(f"🟢 **{lesson['title']}** · {lesson['xp']} XP")
                col_button.button("Start", key=f"start-{lesson['id']}", type="primary",
                                  on_click=start_lesson, args=(lesson["id"],))
            else:
                col_label.markdown(f"🔒 {lesson['title']}")


def render_lesson(conn, email):
    state = st.session_state.lesson
    lesson = next(l for l in all_lessons() if l["id"] == state["id"])
    n_cards, n_questions = len(lesson["cards"]), len(lesson["questions"])

    top_left, top_right = st.columns([4, 1])
    top_left.markdown(f"### {lesson['title']}")
    top_right.button("✕ Quit", on_click=quit_lesson, key="quit-lesson")

    if state["step"] == "cards":
        st.progress((state["card"] + 1) / (n_cards + n_questions))
        st.info(lesson["cards"][state["card"]])
        label = "Continue" if state["card"] + 1 < n_cards else "Start the quiz"
        st.button(label, type="primary", on_click=next_card, args=(lesson,))

    elif state["step"] == "quiz":
        question = lesson["questions"][state["q"]]
        st.progress((n_cards + state["q"] + 1) / (n_cards + n_questions))
        st.caption(f"Question {state['q'] + 1} of {n_questions}")
        key = f"answer-{lesson['id']}-{state['q']}"
        st.radio(question["question"], question["choices"], index=None, key=key,
                 disabled=state["checked"])

        if not state["checked"]:
            st.button("Check", type="primary", disabled=st.session_state.get(key) is None,
                      on_click=check_answer, args=(question, key))
        else:
            if state["last_ok"]:
                st.success(f"Correct! {question['explanation']}")
            else:
                right = question["choices"][question["answer"]]
                st.error(f"Not quite. The answer was **{right}**. {question['explanation']}")
            st.button("Next", type="primary", on_click=next_question, args=(lesson,))

    else:  # done
        score = state["correct"]
        passed = score >= PASS_RATIO * n_questions
        if passed:
            xp = round(lesson["xp"] * score / n_questions)
            if not state["saved"]:
                save_progress(conn, email, lesson["id"], score, xp)
                state["saved"] = True
                st.balloons()
            st.success(f"Lesson complete! {score}/{n_questions} correct · +{xp} XP")
            st.button("Back to the path", type="primary", on_click=quit_lesson)
        else:
            st.warning(f"{score}/{n_questions} correct. You need at least "
                       f"{round(PASS_RATIO * n_questions)} to unlock the next lesson. Give it another try!")
            st.button("Try again", type="primary", on_click=start_lesson, args=(lesson["id"],))
            st.button("Back to the path", on_click=quit_lesson)


def render_academy(conn, email):
    st.subheader("🎓 CryptoCoach Academy")
    progress = get_progress(conn, email)
    render_header(conn, email, progress)
    st.divider()
    if "lesson" in st.session_state:
        render_lesson(conn, email)
    else:
        render_path(progress)
