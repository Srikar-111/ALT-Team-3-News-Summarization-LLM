"""URL Article Extractor — extracts clean news article text from online links."""

import logging
import re
from typing import Any
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)

# Known boilerplate phrases that appear in paywalled or cookie-blocked pages
BOILERPLATE_PHRASES = [
    "you don't have any active subscription",
    "you dont have any active subscription",
    "account subscription benefits",
    "unlock these with subscription",
    "subscribe now",
    "sign in to continue reading",
    "to continue reading, please subscribe",
    "all rights reserved",
    "terms of use",
    "privacy policy",
    "cookie policy",
    "please enable javascript",
    "read more:",
    "related stories:",
    "also read:",
]


def extract_article_from_url(url: str) -> dict[str, Any]:
    """Fetch and parse clean text from a news article URL.
    
    Args:
        url: The web URL of the news article.
        
    Returns:
        dict with keys: url, title, text, description, word_count.
        
    Raises:
        ValueError: If URL is a homepage, paywalled, invalid, or has insufficient content.
    """
    clean_url = url.strip()
    if not clean_url.startswith(("http://", "https://")):
        clean_url = "https://" + clean_url

    parsed = urlparse(clean_url)
    domain = parsed.netloc.replace("www.", "")
    path = parsed.path.strip("/")

    # Check if the user entered a homepage instead of a specific article
    if not path or path in ["", "index.html", "index.php", "home", "en", "news"]:
        raise ValueError(
            f"You entered the main homepage of {domain} instead of a specific article. "
            f"Please click on an individual news story (e.g. {domain}/news/...) and paste that specific link."
        )

    url_regex = re.compile(
        r"^https?://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(/.*)?$", re.IGNORECASE
    )
    if not url_regex.match(clean_url):
        raise ValueError(f"Invalid URL format: '{url}'")

    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }

    try:
        with httpx.Client(timeout=15.0, follow_redirects=True, headers=headers, verify=False) as client:
            response = client.get(clean_url)
            if response.status_code != 200:
                raise ValueError(
                    f"Failed to fetch article (HTTP {response.status_code}). "
                    f"{domain} may be blocking web scrapers or require a paid subscription."
                )
            html = response.text
    except httpx.RequestError as e:
        logger.error(f"Network error fetching {clean_url}: {e}")
        raise ValueError(f"Could not connect to {domain}: {e}")

    soup = BeautifulSoup(html, "html.parser")

    # Remove non-content elements
    for tag in soup(["script", "style", "nav", "footer", "header", "aside", "form", "noscript", "svg", "button", "figure", "figcaption"]):
        tag.decompose()

    # 1. Extract Title
    title = ""
    og_title = soup.find("meta", property="og:title")
    if og_title and og_title.get("content"):
        title = og_title["content"].strip()
    elif soup.find("h1"):
        title = soup.find("h1").get_text().strip()
    elif soup.find("title"):
        title = soup.find("title").get_text().strip()

    title = re.sub(r"\s+[-|]\s+.*$", "", title)

    # 2. Extract Description (editorial ground truth)
    description = ""
    og_desc = soup.find("meta", property="og:description")
    meta_desc = soup.find("meta", attrs={"name": "description"})
    if og_desc and og_desc.get("content"):
        description = og_desc["content"].strip()
    elif meta_desc and meta_desc.get("content"):
        description = meta_desc["content"].strip()

    # 3. Extract Body paragraphs
    article_tag = soup.find("article") or soup.find("main") or soup.find("div", class_=re.compile(r"(article|story|post|entry|content)-body", re.I))
    container = article_tag if article_tag else soup

    paragraphs = []
    for p in container.find_all("p"):
        text = p.get_text().strip()
        text_lower = text.lower()
        if len(text) > 40 and not any(phrase in text_lower for phrase in BOILERPLATE_PHRASES):
            paragraphs.append(text)

    # Fallback to general paragraphs
    if len(paragraphs) < 3 and container != soup:
        for p in soup.find_all("p"):
            text = p.get_text().strip()
            text_lower = text.lower()
            if len(text) > 40 and not any(phrase in text_lower for phrase in BOILERPLATE_PHRASES):
                paragraphs.append(text)

    article_text = "\n\n".join(paragraphs)

    # Detect paywall lockout (e.g. The Hindu preview cutoff)
    if "subscription" in html.lower() and len(article_text.split()) < 75:
        raise ValueError(
            f"This article on {domain} is locked behind a paid subscription paywall. "
            "The site only provides a short 1-sentence teaser. Please copy the article text directly and use 'Paste Text'."
        )

    if len(article_text.strip()) < 100:
        raise ValueError(
            f"Could not extract sufficient article text from {domain}. "
            "The page might require login, a paywall, or client-side JavaScript rendering."
        )

    words = len(article_text.split())

    return {
        "url": clean_url,
        "title": title,
        "text": article_text,
        "description": description,
        "word_count": words,
    }
