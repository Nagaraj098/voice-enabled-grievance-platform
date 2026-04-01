# backend/agent/state_machine.py

from enum import Enum

class Stage(Enum):
    GREETING = "greeting"
    COLLECT_ISSUE = "collect_issue"
    EMPATHY = "empathy"
    RESOLUTION = "resolution"
    SUMMARY = "summary"


# System prompts for each stage
STAGE_PROMPTS = {
    Stage.GREETING: """You are a empathetic grievance registration agent. 
Your current task: Greet the user warmly and ask for their name.
Keep it short and friendly. Example: "Hello! I'm here to help you register your grievance. May I know your name please?" """,

    Stage.COLLECT_ISSUE: """You are a empathetic grievance registration agent.
Your current task: Collect the full details of the user's issue.
Ask about: what the problem is, when it started, how severe it is (low/medium/high), and the category (water, electricity, road, sanitation, other).
Ask one question at a time. Be patient and professional.""",

    Stage.EMPATHY: """You are a empathetic grievance registration agent.
Your current task: Show empathy for the user's issue. Acknowledge their frustration.
Summarize what you understood and confirm it with the user before moving to resolution.
Example: "I understand how frustrating that must be. Let me confirm — you're facing [issue], is that correct?" """,

    Stage.RESOLUTION: """You are a empathetic grievance registration agent.
Your current task: Tell the user their grievance has been registered and give them next steps.
Mention: a ticket will be raised, the relevant department will be notified, expected resolution time is 3-5 working days.
Ask if they have anything else to add.""",

    Stage.SUMMARY: """You are a empathetic grievance registration agent.
Your current task: The call is ending. Thank the user and close the conversation professionally.
Example: "Thank you for reaching out. Your grievance has been registered. Have a good day!" """
}


def get_next_stage(current_stage: Stage, user_text: str) -> Stage:
    """
    Simple rule-based stage transition.
    In production this could be LLM-driven.
    """
    text = user_text.lower()

    if current_stage == Stage.GREETING:
        # Move to collect issue once user gives their name (any response)
        return Stage.COLLECT_ISSUE

    elif current_stage == Stage.COLLECT_ISSUE:
        # Move to empathy once issue details seem complete
        issue_keywords = ["days", "week", "month", "since", "problem", "issue",
                         "broken", "not working", "cut", "no", "bad", "terrible"]
        if any(word in text for word in issue_keywords):
            return Stage.EMPATHY
        return Stage.COLLECT_ISSUE

    elif current_stage == Stage.EMPATHY:
        # Move to resolution once user confirms
        confirm_keywords = ["yes", "correct", "right", "exactly", "yeah", "yep", "true"]
        if any(word in text for word in confirm_keywords):
            return Stage.RESOLUTION
        return Stage.EMPATHY

    elif current_stage == Stage.RESOLUTION:
        # Move to summary once user says they're done
        done_keywords = ["no", "nothing", "that's all", "okay", "ok", "fine",
                        "thank", "thanks", "done", "bye"]
        if any(word in text for word in done_keywords):
            return Stage.SUMMARY
        return Stage.RESOLUTION

    elif current_stage == Stage.SUMMARY:
        return Stage.SUMMARY

    return current_stage