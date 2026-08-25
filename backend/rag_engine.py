import os


# ==========================================
# RAG KNOWLEDGE BASE LOCATION
# ==========================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

KNOWLEDGE_FILE = os.path.join(
    BASE_DIR,
    "data",
    "scam_knowledge.txt"
)


# ==========================================
# LOAD KNOWLEDGE
# ==========================================

def load_knowledge():
    """
    Load scam information from scam_knowledge.txt
    """

    try:

        with open(
            KNOWLEDGE_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            return file.read()

    except FileNotFoundError:

        return "Knowledge base file not found."


# ==========================================
# RETRIEVE RELEVANT KNOWLEDGE
# ==========================================

def retrieve_knowledge(query):
    """
    Find relevant scam information from the
    knowledge base based on the user's message.
    """

    knowledge = load_knowledge()

    if not knowledge:
        return "No scam knowledge available."

    query_words = set(
        query.lower().split()
    )

    sections = knowledge.split("\n\n")

    relevant_sections = []

    for section in sections:

        section_words = set(
            section.lower().split()
        )

        matching_words = query_words.intersection(
            section_words
        )

        if len(matching_words) >= 2:

            relevant_sections.append(section)

    if relevant_sections:

        return "\n\n".join(
            relevant_sections[:3]
        )

    return (
        "No specific information was found "
        "in the scam knowledge base."
    )


# ==========================================
# TEST RAG
# ==========================================

if __name__ == "__main__":

    test_message = """
    URGENT! Your bank account will be blocked.
    Share your OTP immediately to complete KYC.
    """

    result = retrieve_knowledge(test_message)

    print("\n🧠 ThreatTrackers RAG Result")
    print("=" * 40)

    print(result)