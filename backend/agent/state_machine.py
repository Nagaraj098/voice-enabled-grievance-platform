# # backend/agent/state_machine.py

# from enum import Enum

# class Stage(Enum):
#     GREETING = "greeting"
#     COLLECT_ISSUE = "collect_issue"
#     EMPATHY = "empathy"
#     RESOLUTION = "resolution"
#     SUMMARY = "summary"


# # System prompts for each stage
# STAGE_PROMPTS = {
#     Stage.GREETING: """You are a empathetic grievance registration agent. 
# Your current task: Greet the user warmly and ask for their name.
# Be direct and friendly. Ask ONLY for their name first. Example: "Hello! I'm here to help you register your grievance. May I know your name please?" """,

#     Stage.COLLECT_ISSUE: """You are a empathetic grievance registration agent.
# Your current task: Collect the full details of the user's issue.
# Ask about: what the problem is, when it started, how severe it is (low/medium/high), and the category (water, electricity, road, sanitation, other).
# Ask one question at a time. Be patient and professional.""",

#     Stage.EMPATHY: """You are a empathetic grievance registration agent.
# Your current task: Show empathy for the user's issue. Acknowledge their frustration.
# Summarize what you understood and confirm it with the user before moving to resolution.
# Example: "I understand how frustrating that must be. Let me confirm — you're facing [issue], is that correct?" """,

#     Stage.RESOLUTION: """You are a empathetic grievance registration agent.
# Your current task: Tell the user their grievance has been registered and give them next steps.
# Mention: a ticket will be raised, the relevant department will be notified, expected resolution time is 3-5 working days.
# Ask if they have anything else to add.""",

#     Stage.SUMMARY: """You are a empathetic grievance registration agent.
# Your current task: The call is ending. Thank the user and close the conversation professionally.
# Example: "Thank you for reaching out. Your grievance has been registered. Have a good day!" """
# }


# def get_next_stage(current_stage: Stage, user_text: str) -> Stage:
#     """
#     Simple rule-based stage transition.
#     In production this could be LLM-driven.
#     """
#     text = user_text.lower()

#     if current_stage == Stage.GREETING:
#         # Move to collect issue once user gives their name (any response)
#         return Stage.COLLECT_ISSUE

#     elif current_stage == Stage.COLLECT_ISSUE:
#         # Move to empathy once issue details seem complete
#         issue_keywords = ["days", "week", "month", "since", "problem", "issue",
#                          "broken", "not working", "cut", "no", "bad", "terrible"]
#         if any(word in text for word in issue_keywords):
#             return Stage.EMPATHY
#         return Stage.COLLECT_ISSUE

#     elif current_stage == Stage.EMPATHY:
#         # Move to resolution once user confirms
#         confirm_keywords = ["yes", "correct", "right", "exactly", "yeah", "yep", "true"]
#         if any(word in text for word in confirm_keywords):
#             return Stage.RESOLUTION
#         return Stage.EMPATHY

#     elif current_stage == Stage.RESOLUTION:
#         # Move to summary once user says they're done
#         done_keywords = ["no", "nothing", "that's all", "okay", "ok", "fine",
#                         "thank", "thanks", "done", "bye"]
#         if any(word in text for word in done_keywords):
#             return Stage.SUMMARY
#         return Stage.RESOLUTION

#     elif current_stage == Stage.SUMMARY:
#         return Stage.SUMMARY

#     return current_stage


# backend/agent/state_machine.py

from enum import Enum


class Stage(Enum):
    GREETING      = "greeting"
    COLLECT_NAME  = "collect_name"
    COLLECT_ISSUE = "collect_issue"
    EMPATHY       = "empathy"
    RESOLUTION    = "resolution"
    SUMMARY       = "summary"


STAGE_PROMPTS = {

    Stage.GREETING: """You are a professional grievance registration agent for GRS (Grievance Registration System).
Greet the user warmly in one sentence, then ask for their full name.
Keep it short. Example:
"Hello! Welcome to the Grievance Registration System. May I know your full name please?" """,

    Stage.COLLECT_NAME: """You are a professional grievance registration agent.
The user has given their name. Acknowledge it warmly and then ask what category their issue belongs to.
Give them clear options: Water Supply, Electricity, Road, Sanitation, Network, or Other.
Example:
"Thank you, [Name]! Could you tell me which category your issue falls under?
Is it Water Supply, Electricity, Road, Sanitation, Network, or something else?" """,

    Stage.COLLECT_ISSUE: """You are a professional grievance registration agent.
The user has given their name and category. Now collect the full details of their complaint.
Ask: what exactly is the problem, when did it start, and how severe is it.
Ask one question at a time. Be patient and empathetic.
Example: "I understand. Could you please describe what exactly is happening with your [category] issue?" """,

    Stage.EMPATHY: """You are a professional grievance registration agent.
Show empathy for the user's issue. Acknowledge their frustration.
Summarize what you understood and confirm it with the user.
Example: "I understand how frustrating that must be. Let me confirm — you're facing [issue summary], is that correct?" """,

    Stage.RESOLUTION: """You are a professional grievance registration agent.
Tell the user their grievance has been registered and give them next steps.
Mention: ticket will be raised, relevant department notified, resolution in 3-5 working days.
Ask if they have anything else to add.""",

    Stage.SUMMARY: """You are a professional grievance registration agent.
The call is ending. Thank the user and close the conversation professionally.
Example: "Thank you [Name] for reaching out. Your grievance has been registered. Have a great day!" """
}


def get_next_stage(current_stage: Stage, user_text: str) -> Stage:
    text = user_text.lower().strip()

    if current_stage == Stage.GREETING:
        # Any response → move to collect name confirmation
        return Stage.COLLECT_NAME

    elif current_stage == Stage.COLLECT_NAME:
        # User gave category or any response → move to collect issue
        category_keywords = [
            "water", "electricity", "road", "sanitation",
            "network", "other", "supply", "light", "power",
            "garbage", "drain", "internet", "street"
        ]
        if any(word in text for word in category_keywords):
            return Stage.COLLECT_ISSUE
        # If they just said category without keywords, still move forward
        if len(text.split()) <= 5:
            return Stage.COLLECT_ISSUE
        return Stage.COLLECT_NAME

    elif current_stage == Stage.COLLECT_ISSUE:
        # Move to empathy when issue details are complete
        issue_keywords = [
            "days", "week", "month", "since", "problem", "issue",
            "broken", "not working", "cut", "no ", "bad", "terrible",
            "hours", "yesterday", "today", "morning", "night",
            "contaminated", "dirty", "blocked", "leaking", "damaged"
        ]
        if any(word in text for word in issue_keywords):
            return Stage.EMPATHY
        return Stage.COLLECT_ISSUE

    elif current_stage == Stage.EMPATHY:
        # Move to resolution when user confirms
        confirm_keywords = [
            "yes", "correct", "right", "exactly", "yeah",
            "yep", "true", "that's right", "confirmed", "ok"
        ]
        if any(word in text for word in confirm_keywords):
            return Stage.RESOLUTION
        return Stage.EMPATHY

    elif current_stage == Stage.RESOLUTION:
        # Move to summary when user is done
        done_keywords = [
            "no", "nothing", "that's all", "okay", "ok",
            "fine", "thank", "thanks", "done", "bye", "good"
        ]
        if any(word in text for word in done_keywords):
            return Stage.SUMMARY
        return Stage.RESOLUTION

    elif current_stage == Stage.SUMMARY:
        return Stage.SUMMARY

    return current_stage