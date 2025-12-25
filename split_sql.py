# Read the attached content and split into 3 parts
content = """USER PROVIDED CONTENT HERE"""

# Split by the part markers
parts = content.split('-- ============================================================================\n-- LUNONEX DATABASE SETUP - PART')

# Part 1 is at index 3 (after "1 OF 3")
# Part 2 is at index 2  
# Part 3 is at index 1

for i, part in enumerate(parts):
    if '1 OF 3' in part:
        with open('SUPABASE-PART-1-SOCIAL-PLATFORM.sql', 'w', encoding='utf-8') as f:
            f.write('-- ============================================================================\n-- LUNONEX DATABASE SETUP - PART' + part)
        print("Created Part 1")
    elif '2 OF 3' in part:
        with open('SUPABASE-PART-2-TIERS-MARKETPLACES.sql', 'w', encoding='utf-8') as f:
            f.write('-- ============================================================================\n-- LUNONEX DATABASE SETUP - PART' + part)
        print("Created Part 2")
    elif '3 OF 3' in part:
        with open('SUPABASE-PART-3-CUSTOMIZATION.sql', 'w', encoding='utf-8') as f:
            f.write('-- ============================================================================\n-- LUNONEX DATABASE SETUP - PART' + part)
        print("Created Part 3")
