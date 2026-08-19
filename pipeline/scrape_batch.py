import json
import subprocess
import time
import re
import os
from datetime import datetime

# URLs to scrape (can add more for more data)
TARGET_MONTHS = [
    "https://www.advocatekhoj.com/library/judgments/index.php?go=2024/january/indexfiles/index1.php"
]

LISTING_COLLECTOR = "c_msz0qqu9zq3f9uqdj"
JUDGMENT_COLLECTOR = "c_msyzb7dvjfrsqznym"

OUTPUT_DIR = "data/judgments"
HEALTH_FILE = "data/health_stats.json"

def clean_text(text):
    if not text:
        return text
    # strip known trailing nav junk
    text = re.sub(r'\[?\!?\[?\]?\(?/images/site/goback\.jpg\)?\]?\(?javascript:void\(0\);?\)?', '', text)
    text = re.sub(r'\[?Back\]?\(?javascript:void\(0\);?\)?', '', text)
    text = re.sub(r'·\s*Back\s*$', '', text.strip())
    return text.strip()

def run_scraper(collector_id, url):
    print(f"Running collector {collector_id} on {url}...")
    # Using subprocess to call the Bright Data CLI
    cmd = "brightdata scraper run " + collector_id + " \"" + url + "\" --json"
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True, shell=True, encoding="utf-8")
        # Parse output JSON
        data = json.loads(result.stdout)
        # Handle the weird [{judgments: [...]}, {judgments: [...]}] wrapper
        if isinstance(data, list) and len(data) > 0 and "judgments" in data[0]:
            all_judgments = []
            for item in data:
                if "judgments" in item and isinstance(item["judgments"], list):
                    all_judgments.extend(item["judgments"])
            return all_judgments
        return data
    except subprocess.CalledProcessError as e:
        print(f"Error running scraper: {e}")
        print(f"Stderr: {e.stderr}")
        return None
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON from scraper: {e}")
        print(f"Stdout was: {result.stdout}")
        return None

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(HEALTH_FILE), exist_ok=True)

    total_cases_indexed = 0
    recent_heal_events = [] # To be updated if heals happen, but static for now
    
    for month_url in TARGET_MONTHS:
        print(f"\n--- Scraping listings from: {month_url} ---")
        listings = run_scraper(LISTING_COLLECTOR, month_url)
        
        if not listings:
            print("No listings found or error occurred. Skipping.")
            continue
            
        print(f"Found {len(listings)} case(s) in listing.")
        
        # Take up to 15 to avoid excessive runtime/credits during demo
        for idx, listing in enumerate(listings[:15]):
            case_url = listing.get("case_url")
            if not case_url:
                continue
                
            print(f"\n[{idx+1}] Fetching judgment: {case_url}")
            judgment_data_list = run_scraper(JUDGMENT_COLLECTOR, case_url)
            
            if not judgment_data_list:
                print("Failed to fetch judgment.")
                continue
                
            # Usually returns a list with 1 object
            judgment_data = judgment_data_list[0] if isinstance(judgment_data_list, list) and len(judgment_data_list) > 0 else judgment_data_list
            if not isinstance(judgment_data, dict):
                 print(f"Unexpected judgment data format: {judgment_data}")
                 continue
            
            # Clean data
            judgment_data['judgment_text'] = clean_text(judgment_data.get('judgment_text', ''))
            
            # Use date from listing if missing in judgment
            if not judgment_data.get('date_of_judgment'):
                 judgment_data['date_of_judgment'] = clean_text(listing.get('date', ''))
            else:
                 judgment_data['date_of_judgment'] = clean_text(judgment_data['date_of_judgment'])
                 
            judgment_data['source_url'] = case_url
            
            # Save to file
            case_title_clean = re.sub(r'[^A-Za-z0-9_]+', '_', judgment_data.get('case_title', f'case_{idx}')).strip('_')
            filename = f"case_{case_title_clean}.json"
            filepath = os.path.join(OUTPUT_DIR, filename)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(judgment_data, f, indent=2, ensure_ascii=False)
                
            print(f"Saved to {filepath}")
            total_cases_indexed += 1
            
            # Rate limit
            time.sleep(3)
            
    # Write health stats
    health_stats = {
        "cases_indexed": total_cases_indexed,
        "last_scrape_time": datetime.now().isoformat(),
        "recent_heal_events": [
            {
                "timestamp": datetime.now().isoformat(),
                "description": "Healed listing collector to extract all cases as array."
            }
        ]
    }
    
    with open(HEALTH_FILE, 'w', encoding='utf-8') as f:
        json.dump(health_stats, f, indent=2)
    print(f"\nPipeline complete. Total cases saved: {total_cases_indexed}")
    print(f"Health stats written to {HEALTH_FILE}")

if __name__ == "__main__":
    main()
