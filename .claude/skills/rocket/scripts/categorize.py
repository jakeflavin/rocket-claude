#!/usr/bin/env python3
"""
categorize.py

Assigns category and subcategory to a transaction.

Strategy:
  1. Rule-based keyword matching on normalized_description and merchant
  2. AI fallback (Claude API) for unmatched transactions

Returns:
  (category, subcategory, needs_review)
"""

import os
import re
import json
import logging

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Rule definitions
# Each rule is a tuple of (pattern, category, subcategory)
# Pattern is matched case-insensitively against normalized_description + merchant
# ---------------------------------------------------------------------------
RULES: list[tuple[str, str, str]] = [
    # Income
    (r"\b(payroll|salary|direct deposit|paycheque|paycheck)\b", "Income", "Salary"),
    (r"\b(bonus)\b", "Income", "Bonus"),
    (r"\b(interest paid|interest earned)\b", "Income", "Interest"),
    (r"\b(dividend)\b", "Income", "Dividends"),
    (r"\b(refund|reversal|cashback|cash back)\b", "Income", "Refund"),

    # Housing
    (r"\b(rent|lease payment)\b", "Housing", "Rent"),
    (r"\b(mortgage)\b", "Housing", "Mortgage"),
    (r"\b(property tax)\b", "Housing", "Property Tax"),
    (r"\b(hoa|strata|condo fee)\b", "Housing", "HOA"),
    (r"\b(home depot|lowes|rona|home hardware|plumbing|roofing|renovation)\b", "Housing", "Home Maintenance"),

    # Utilities
    (r"\b(hydro|bc hydro|toronto hydro|hydro one|electricity|enmax|epcor)\b", "Utilities", "Electricity"),
    (r"\b(water bill|waterworks)\b", "Utilities", "Water"),
    (r"\b(enbridge|gas bill|natural gas|fortis bc)\b", "Utilities", "Gas"),
    (r"\b(rogers|bell|telus|shaw|videotron|internet|wifi|broadband)\b", "Utilities", "Internet"),
    (r"\b(fido|koodo|public mobile|chatr|freedom mobile|phone plan|wireless plan)\b", "Utilities", "Phone"),

    # Groceries
    (r"\b(loblaws|superstore|sobeys|metro|iga|save on foods|freshco|food basics|no frills|walmart grocery|whole foods|thrifty foods|farm boy)\b", "Groceries", "Supermarket"),
    (r"\b(costco|sams club)\b", "Groceries", "Wholesale Club"),

    # Food & Drink
    (r"\b(starbucks|tim hortons|second cup|timmies|blenz|coffee|cafe|espresso)\b", "Food & Drink", "Coffee"),
    (r"\b(uber eats|doordash|skip the dishes|skipthedishes|instacart restaurant|grubhub)\b", "Food & Drink", "Dining Out"),
    (r"\b(restaurant|bistro|grill|kitchen|sushi|ramen|pho|thai|indian|pizza|steakhouse|diner|eatery|brasserie)\b", "Food & Drink", "Dining Out"),
    (r"\b(mcdonald|mcdonalds|wendy|burger king|tim horton|subway|a&w|dairy queen|kfc|taco bell|popeyes|five guys|harvey)\b", "Food & Drink", "Fast Food"),
    (r"\b(bar|pub|brewery|taproom|liquor|lcbo|bcliquor|bc liquor|saq|nslc|beer store|wine|spirits)\b", "Food & Drink", "Bars"),

    # Transportation
    (r"\b(shell|esso|petro canada|petrocanada|chevron|husky|pioneer gas|gas station|fuel)\b", "Transportation", "Gas"),
    (r"\b(ttc|translink|stm|oc transpo|presto|compass card|transit|bus pass|metro pass|train pass)\b", "Transportation", "Public Transit"),
    (r"\b(parking|impark|indigo park|honk|greenp|sp plus)\b", "Transportation", "Parking"),
    (r"\b(uber|lyft|rideshare|ride share|taxi|cab)\b", "Transportation", "Rideshare"),
    (r"\b(jiffy lube|midas|mr lube|oil change|tire|canadian tire auto|auto repair|mechanic|car wash)\b", "Transportation", "Car Maintenance"),

    # Subscriptions
    (r"\b(netflix|spotify|disney|apple tv|crave|prime video|youtube premium|hulu|hbo|paramount)\b", "Subscriptions", "Streaming"),
    (r"\b(adobe|microsoft 365|google one|dropbox|github|notion|slack|zoom|1password|chatgpt|openai|anthropic)\b", "Subscriptions", "Software"),
    (r"\b(gym|goodlife|planet fitness|ymca|equinox|anytime fitness|membership|club fee|association fee)\b", "Subscriptions", "Memberships"),

    # Shopping
    (r"\b(amazon|ebay|etsy|aliexpress|wish)\b", "Shopping", "General Merchandise"),
    (r"\b(zara|h&m|gap|old navy|banana republic|uniqlo|roots|nordstrom|winners|marshalls|sport chek|lululemon|nike|adidas|aldo|skechers)\b", "Shopping", "Clothing"),
    (r"\b(best buy|apple store|samsung|staples|london drugs electronics|newegg|bhphotovideo)\b", "Shopping", "Electronics"),
    (r"\b(ikea|wayfair|structube|article|west elm|pottery barn|homesense|bed bath|pier 1|crate and barrel)\b", "Shopping", "Home Goods"),

    # Health
    (r"\b(doctor|clinic|hospital|specialist|physiotherapy|chiropractic|dentist|optometrist|health center|medical)\b", "Health", "Medical"),
    (r"\b(shoppers drug mart|rexall|london drugs|pharmasave|pharmacy|prescription|rx)\b", "Health", "Pharmacy"),
    (r"\b(goodlife|ymca|equinox|planet fitness|fitness|peloton|strava|runkeeper|personal trainer)\b", "Health", "Fitness"),

    # Travel
    (r"\b(air canada|westjet|porter|airfare|airline|flight|expedia flights|kayak flights)\b", "Travel", "Flights"),
    (r"\b(hotel|marriott|hilton|fairmont|hyatt|ihg|sheraton|airbnb|vrbo|booking\.com)\b", "Travel", "Hotels"),
    (r"\b(enterprise|hertz|avis|budget car|national car|rental car)\b", "Travel", "Rental Car"),
    (r"\b(tour|excursion|attraction|activity|museum|zoo|theme park|adventure)\b", "Travel", "Activities"),

    # Entertainment
    (r"\b(cineplex|landmark cinema|amc|movie|theatre|theater)\b", "Entertainment", "Movies"),
    (r"\b(steam|playstation|xbox|nintendo|psn|epic games|ea games|gaming|video game)\b", "Entertainment", "Games"),
    (r"\b(ticketmaster|eventbrite|concert|festival|sport ticket|nhl|nba|mlb|nfl|mls|live event)\b", "Entertainment", "Events"),
]


def match_rules(text: str) -> tuple[str, str] | None:
    """
    Try each rule against the input text.
    Returns (category, subcategory) on first match, or None.
    """
    normalized = text.lower()
    for pattern, category, subcategory in RULES:
        if re.search(pattern, normalized):
            return category, subcategory
    return None


def categorize_with_ai(description: str, merchant: str) -> tuple[str, str]:
    """
    Use Claude API to categorize a transaction that didn't match any rule.
    Returns (category, subcategory). Falls back to Misc/Uncategorized on error.
    """
    try:
        import anthropic

        client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

        valid_categories = """
Income: Salary, Bonus, Interest, Dividends, Refund, Other Income
Housing: Rent, Mortgage, Property Tax, HOA, Home Maintenance
Utilities: Electricity, Water, Gas, Internet, Phone
Groceries: Supermarket, Wholesale Club
Food & Drink: Coffee, Dining Out, Fast Food, Bars
Transportation: Gas, Public Transit, Parking, Rideshare, Car Maintenance
Subscriptions: Streaming, Software, Memberships
Shopping: General Merchandise, Clothing, Electronics, Home Goods
Health: Medical, Pharmacy, Fitness
Travel: Flights, Hotels, Rental Car, Activities
Entertainment: Movies, Games, Events
Misc: Uncategorized
"""

        prompt = f"""You are categorizing a bank transaction. Return ONLY a JSON object with "category" and "subcategory" fields.
Use only the categories and subcategories from this list:
{valid_categories}

Transaction description: {description}
Merchant: {merchant}

Rules:
- Pick the most specific matching category and subcategory
- If unsure, use Misc / Uncategorized
- Return ONLY valid JSON, no explanation, no markdown

Example: {{"category": "Food & Drink", "subcategory": "Dining Out"}}"""

        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=100,
            messages=[{"role": "user", "content": prompt}],
        )

        raw = message.content[0].text.strip()
        result = json.loads(raw)
        return result.get("category", "Misc"), result.get("subcategory", "Uncategorized")

    except Exception as e:
        log.warning(f"AI categorization failed for '{description}': {e}")
        return "Misc", "Uncategorized"


def categorize(normalized_description: str, merchant: str) -> tuple[str, str, bool]:
    """
    Main categorization entry point.

    Returns:
        (category, subcategory, needs_review)
        needs_review is True when AI was used, False when a rule matched.
    """
    combined = f"{normalized_description} {merchant}"

    match = match_rules(combined)
    if match:
        category, subcategory = match
        return category, subcategory, False

    # No rule matched — use AI
    log.info(f"No rule match for '{normalized_description}' — using AI categorization.")
    category, subcategory = categorize_with_ai(normalized_description, merchant)
    return category, subcategory, True
