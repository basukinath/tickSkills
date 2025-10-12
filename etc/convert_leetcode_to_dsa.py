#!/usr/bin/env python3
"""
Convert leetcode_questions.json to 500_dsa_questions.json format
Maps topics to categories and transforms the data structure
"""

import json

def derive_category_from_topics(topics):
    """
    Derive a primary category from the list of topics.
    Returns a category string matching 500_dsa_questions.json categories.
    """
    if not topics:
        return "Miscellaneous"
    
    # Convert topics to lowercase for matching
    topics_lower = [t.lower() for t in topics]
    
    # Category mapping rules (order matters - more specific first)
    category_rules = {
        "Graph": ["graph", "shortest path", "topological sort", "minimum spanning tree", 
                  "strongly connected component", "eulerian circuit", "biconnected component",
                  "union find", "depth-first search", "breadth-first search"],
        
        "Trees": ["tree", "binary tree", "binary search tree", "segment tree", "binary indexed tree",
                  "n-ary tree"],
        
        "Trie": ["trie", "suffix tree"],
        
        "Dynamic Programming": ["dynamic programming", "memoization"],
        
        "Arrays & Hashing": ["array", "matrix", "prefix sum", "hash table", "hash function", "counting"],
        
        "Two Pointers": ["two pointers"],
        
        "Sliding Window": ["sliding window"],
        
        "String": ["string", "string matching", "rolling hash", "suffix array"],
        
        "Linked List": ["linked list", "doubly-linked list"],
        
        "Stack": ["stack", "monotonic stack"],
        
        "Heap": ["heap", "heap (priority queue)", "priority queue"],
        
        "Binary Search": ["binary search"],
        
        "Backtracking": ["backtracking"],
        
        "Greedy": ["greedy"],
        
        "Intervals": ["merge intervals", "interval"],
        
        "Math & Geometry": ["math", "number theory", "geometry", "combinatorics", 
                            "probability and statistics", "game theory", "enumeration",
                            "bit manipulation", "bitmask"],
        
        "1-D DP": ["1d dynamic programming"],
        
        "2-D DP": ["2d dynamic programming", "matrix chain multiplication"],
        
        "Bit Manipulation": ["bit manipulation", "bitmask"],
        
        "Divide & Conquer": ["divide and conquer"],
        
        "Sorting": ["sorting", "quickselect", "merge sort", "bucket sort", "radix sort", "counting sort"],
        
        "Design": ["design", "data stream", "iterator", "randomized", "queue", "monotonic queue"],
        
        "Recursion": ["recursion"],
        
        "Database": ["database"],
        
        "Concurrency": ["concurrency"],
        
        "Simulation": ["simulation", "brainteaser", "interactive"]
    }
    
    # Check each category's keywords against topics
    for category, keywords in category_rules.items():
        for keyword in keywords:
            if keyword in topics_lower:
                return category
    
    # If no match found, use the first topic as category (capitalized)
    first_topic = topics[0]
    # Handle special cases
    if first_topic.lower() == "array":
        return "Arrays & Hashing"
    elif first_topic.lower() == "hash table":
        return "Arrays & Hashing"
    elif first_topic.lower() == "tree":
        return "Trees"
    elif first_topic.lower() == "linked list":
        return "Linked List"
    else:
        return first_topic.title()


def extract_titleslug_from_url(url):
    """Extract titleSlug from URL"""
    if not url:
        return ""
    # URL format: https://leetcode.com/problems/{titleSlug}/
    parts = url.rstrip('/').split('/')
    if len(parts) >= 5 and parts[-2] == 'problems':
        return parts[-1]
    return ""


def convert_leetcode_to_dsa(leetcode_data):
    """
    Convert leetcode_questions.json format to 500_dsa_questions.json format
    """
    converted_questions = []
    
    for idx, item in enumerate(leetcode_data, start=1):
        try:
            # Navigate nested structure
            question = item.get("data", {}).get("question", {})
            
            # Extract topics
            topic_tags = question.get("topicTags", [])
            topics = [tag.get("name", "") for tag in topic_tags if tag.get("name")]
            
            # Build URL
            url = question.get("url", "")
            if not url:
                title_slug = extract_titleslug_from_url(url)
                if not title_slug:
                    # Generate slug from title
                    title = question.get("title", f"Question {idx}")
                    title_slug = title.lower().replace(" ", "-").replace("'", "")
                url = f"https://leetcode.com/problems/{title_slug}/"
            
            # Create converted question
            converted = {
                "id": int(question.get("questionFrontendId", idx)),
                "title": question.get("title", f"Question {idx}"),
                "slug": extract_titleslug_from_url(url) or question.get("title", "").lower().replace(" ", "-"),
                "difficulty": question.get("difficulty", "Medium"),
                "category": derive_category_from_topics(topics),
                "source": "LEETCODE",
                "external_url": url,
                "is_active": True,
                "is_premium": question.get("isPaidOnly", False),
                "acceptance_rate": None,
                "companies": None,
                "tags": topics
            }
            
            converted_questions.append(converted)
            
        except Exception as e:
            print(f"Error processing question {idx}: {str(e)}")
            continue
    
    return converted_questions


def main():
    print("🚀 Starting conversion: leetcode_questions.json → leetcode_dsa_questions.json")
    
    # Read input file
    print("📖 Reading leetcode_questions.json...")
    with open('leetcode_questions.json', 'r', encoding='utf-8') as f:
        leetcode_data = json.load(f)
    
    print(f"✅ Loaded {len(leetcode_data)} questions")
    
    # Convert data
    print("🔄 Converting to DSA format with category mapping...")
    converted_data = convert_leetcode_to_dsa(leetcode_data)
    
    print(f"✅ Converted {len(converted_data)} questions")
    
    # Category distribution
    category_counts = {}
    for q in converted_data:
        cat = q["category"]
        category_counts[cat] = category_counts.get(cat, 0) + 1
    
    print("\n📊 Category Distribution:")
    for cat, count in sorted(category_counts.items(), key=lambda x: -x[1]):
        print(f"   {cat}: {count}")
    
    # Write output file
    output_file = 'leetcode_dsa_questions.json'
    print(f"\n💾 Writing to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(converted_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Successfully created {output_file}")
    print(f"\n🎉 Conversion complete! {len(converted_data)} questions ready to import.")


if __name__ == "__main__":
    main()
