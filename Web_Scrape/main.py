import requests
from bs4 import BeautifulSoup
import re

def scrape_links_with_pattern(url, pattern):
    try:
        response = requests.get(url)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, "html.parser")

        links = []
        for a_tag in soup.find_all("a"):
            link = a_tag.get("href")
            if link and re.search(pattern, link):
                links.append(link)

        return links
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return []

if __name__ == "__main__":
    website_url = "https://www.tarabrach.com"  # Replace with the URL of the website you want to scrape
    link_pattern = r'https://www\.tarabrach\.com/\?powerpress_pinw=\d+-podcast'  # Define the regex pattern

    links = scrape_links_with_pattern(website_url, link_pattern)
    
    for link in links:
        print(link)
