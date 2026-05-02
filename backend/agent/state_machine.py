# from enum import Enum


# class Stage(Enum):
#     GREETING      = "greeting"
#     COLLECT_NAME  = "collect_name"
#     COLLECT_ISSUE = "collect_issue"
#     EMPATHY       = "empathy"
#     RESOLUTION    = "resolution"
#     SUMMARY       = "summary"


# STAGE_PROMPTS = {

#     Stage.GREETING: """You are a professional grievance registration agent for GRS (Grievance Registration System).
# Greet the user warmly in one sentence, then ask for their full name.
# Keep it short. Example:
# "Hello! Welcome to the Grievance Registration System. May I know your full name please?" """,

#     Stage.COLLECT_NAME: """You are a professional grievance registration agent.
# The user has given their name. Acknowledge it warmly and then ask what category their issue belongs to.
# Give them clear options: Water Supply, Electricity, Road, Sanitation, Network, or Other.
# Example:
# "Thank you, [Name]! Could you tell me which category your issue falls under?
# Is it Water Supply, Electricity, Road, Sanitation, Network, or something else?" """,

#     Stage.COLLECT_ISSUE: """You are a professional grievance registration agent.
# The user has given their name and category. Now collect the full details of their complaint.
# Ask: what exactly is the problem, when did it start, and how severe is it.
# Ask one question at a time. Be patient and empathetic.
# Example: "I understand. Could you please describe what exactly is happening with your [category] issue?" """,

#     Stage.EMPATHY: """You are a professional grievance registration agent.
# Show empathy for the user's issue. Acknowledge their frustration.
# Summarize what you understood and confirm it with the user.
# Example: "I understand how frustrating that must be. Let me confirm — you're facing [issue summary], is that correct?" """,

#     Stage.RESOLUTION: """You are a professional grievance registration agent.
# Tell the user their grievance has been registered and give them next steps.
# Mention: ticket will be raised, relevant department notified, resolution in 3-5 working days.
# Ask if they have anything else to add.""",

#     Stage.SUMMARY: """You are a professional grievance registration agent.
# The call is ending. Thank the user and close the conversation professionally.
# Example: "Thank you [Name] for reaching out. Your grievance has been registered. Have a great day!" """
# }


# def get_next_stage(current_stage: Stage, user_text: str) -> Stage:
#     text = user_text.lower().strip()

#     if current_stage == Stage.GREETING:
#         # Any response → move to collect name confirmation
#         return Stage.COLLECT_NAME

#     elif current_stage == Stage.COLLECT_NAME:
#         # User gave category or any response → move to collect issue
#         category_keywords = [
#             "water", "electricity", "road", "sanitation",
#             "network", "other", "supply", "light", "power",
#             "garbage", "drain", "internet", "street"
#         ]
#         if any(word in text for word in category_keywords):
#             return Stage.COLLECT_ISSUE
#         # If they just said category without keywords, still move forward
#         if len(text.split()) <= 5:
#             return Stage.COLLECT_ISSUE
#         return Stage.COLLECT_NAME

#     elif current_stage == Stage.COLLECT_ISSUE:
#         # Move to empathy when issue details are complete
#         issue_keywords = [
#             "days", "week", "month", "since", "problem", "issue",
#             "broken", "not working", "cut", "no ", "bad", "terrible",
#             "hours", "yesterday", "today", "morning", "night",
#             "contaminated", "dirty", "blocked", "leaking", "damaged"
#         ]
#         if any(word in text for word in issue_keywords):
#             return Stage.EMPATHY
#         return Stage.COLLECT_ISSUE

#     elif current_stage == Stage.EMPATHY:
#         # Move to resolution when user confirms
#         confirm_keywords = [
#             "yes", "correct", "right", "exactly", "yeah",
#             "yep", "true", "that's right", "confirmed", "ok"
#         ]
#         if any(word in text for word in confirm_keywords):
#             return Stage.RESOLUTION
#         return Stage.EMPATHY

#     elif current_stage == Stage.RESOLUTION:
#         # Move to summary when user is done
#         done_keywords = [
#             "no", "nothing", "that's all", "okay", "ok",
#             "fine", "thank", "thanks", "done", "bye", "good"
#         ]
#         if any(word in text for word in done_keywords):
#             return Stage.SUMMARY
#         return Stage.RESOLUTION

#     elif current_stage == Stage.SUMMARY:
#         return Stage.SUMMARY

#     return current_stage


#do not removw above one

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

    Stage.COLLECT_ISSUE: """You are a professional grievance registration agent for GRS.
The user is describing their complaint.

Follow this priority order STRICTLY:

STEP 1 — CHECK KNOWLEDGE BASE FIRST:
If a "Relevant Knowledge Base" section is provided below in this prompt:
- Use ONLY the helpline numbers, resolution times, department names, penalties, and contacts from it.
- Do NOT use any phone numbers or facts from your own memory.
- After understanding the issue, share the relevant helpline number and resolution time from the knowledge base.
- Example: "I have noted your issue. Based on our records, you can call [number from KB] and this will be resolved within [time from KB]."

STEP 2 — IF NO KNOWLEDGE BASE CONTEXT:
If no knowledge base context is provided, follow the general grievance flow:
- Ask what exactly is the problem.
- Ask when it started.
- Ask how severe it is.
- Be empathetic and ask one question at a time.
- Example: "I understand. Could you please describe what exactly is happening with your issue?"

Always be empathetic and concise.""",

    Stage.EMPATHY: """You are a professional grievance registration agent for GRS.
Show empathy for the user's issue. Acknowledge their frustration.
Summarize what you understood and confirm it with the user.

Follow this priority order STRICTLY:

STEP 1 — CHECK KNOWLEDGE BASE FIRST:
If a "Relevant Knowledge Base" section is provided:
- Reference the specific resolution time and department name from it.
- Example: "I understand how frustrating that must be. Based on our records, [department from KB] resolves this within [time from KB]. Let me confirm — you're facing [issue summary], is that correct?"

STEP 2 — IF NO KNOWLEDGE BASE CONTEXT:
- Use general empathy and a standard resolution time of 3 to 5 working days.
- Example: "I understand how frustrating that must be. Let me confirm — you're facing [issue summary], is that correct?" """,

    Stage.RESOLUTION: """You are a professional grievance registration agent for GRS.
Tell the user their grievance has been registered and give them next steps.

Follow this priority order STRICTLY:

STEP 1 — CHECK KNOWLEDGE BASE FIRST:
If a "Relevant Knowledge Base" section is provided:
- Use ONLY the helpline number, department name, and resolution time from it. Do NOT use your own memory for any contact details.
- Example: "Your grievance has been registered. The [department from KB] will be notified. You can also call [number from KB] directly. Resolution is expected within [time from KB]."

STEP 2 — IF NO KNOWLEDGE BASE CONTEXT:
- Use the general flow: ticket raised, relevant department notified, resolution in 3 to 5 working days.
- Example: "Your grievance has been registered. The concerned department will be notified and will resolve this within 3 to 5 working days."

Ask if they have anything else to add.""",

    Stage.SUMMARY: """You are a professional grievance registration agent.
The call is ending. Thank the user and close the conversation professionally.
Example: "Thank you [Name] for reaching out. Your grievance has been registered. Have a great day!" """
}


def get_next_stage(current_stage: Stage, user_text: str) -> Stage:
    text = user_text.lower().strip()

    if current_stage == Stage.GREETING:
        return Stage.COLLECT_NAME

    elif current_stage == Stage.COLLECT_NAME:
        category_keywords = [
            "water", "electricity", "road", "sanitation",
            "network", "other", "supply", "light", "power",
            "garbage", "drain", "internet", "street"
        ]
        if any(word in text for word in category_keywords):
            return Stage.COLLECT_ISSUE
        if len(text.split()) <= 5:
            return Stage.COLLECT_ISSUE
        return Stage.COLLECT_NAME

    elif current_stage == Stage.COLLECT_ISSUE:
        issue_keywords = [
            "days", "week", "month", "since", "problem", "issue",
            "broken", "not working", "cut", "no ", "bad", "terrible",
            "hours", "yesterday", "today", "morning", "night",
            "contaminated", "dirty", "blocked", "leaking", "damaged",
            "smoke", "pollution", "flood", "pothole", "tax", "bill",
        ]
        if any(word in text for word in issue_keywords):
            return Stage.EMPATHY
        return Stage.COLLECT_ISSUE

    elif current_stage == Stage.EMPATHY:
        confirm_keywords = [
            "yes", "correct", "right", "exactly", "yeah",
            "yep", "true", "that's right", "confirmed", "ok"
        ]
        if any(word in text for word in confirm_keywords):
            return Stage.RESOLUTION
        return Stage.EMPATHY

    elif current_stage == Stage.RESOLUTION:
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