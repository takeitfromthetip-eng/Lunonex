# LUNONEX DATABASE - COMPLETE TABLE LIST (Quick Reference)
**Total: 123 Tables**

---

## PART 0: CRYPTO PAYMENTS & AI COMPANION STORE (2 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 1 | crypto_payments | N/A | Crypto payment tracking (referenced only) |
| 2 | user_purchases | 52 | AI companion/asset purchases |

---

## PART 1: LULU BOOK PRINTING SYSTEM (4 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 3 | book_products | 71 | Creator-uploaded book products |
| 4 | book_orders | 102 | Book order processing |
| 5 | creator_payouts | 137 | Book creator earnings |
| 6 | book_reviews | 162 | Book ratings and reviews |

---

## PART 2: PROFILE CUSTOMIZATION SYSTEM (8 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 7 | profile_themes | 259 | Pre-built & user-created themes |
| 8 | profile_customizations | 370 | User profile settings (tier-locked) |
| 9 | profile_sounds | 448 | Sound effects library |
| 10 | profile_animations | 484 | Animation library |
| 11 | profile_widgets | 518 | Interactive widget library |
| 12 | user_widgets | 549 | User's active widget instances |
| 13 | cursor_styles | 570 | Custom cursor styles |
| 14 | background_templates | 597 | Video/3D/VR backgrounds |

---

## PART 3: TIER SYSTEM & MARKETPLACES (23 Tables)

### Tier System (4 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 15 | platform_tiers | 928 | 7 tiers (FREE-DIAMOND) |
| 16 | tier_features | 967 | 127 tier-locked features |
| 17 | user_tier_progress | 1132 | User's current tier & spending |
| 18 | user_feature_unlocks | 1149 | Individual feature grants |

### Referral & Influencer System (4 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 19 | user_referrals | 1166 | User referral tracking |
| 20 | referral_rewards | 1180 | Referral rewards (5 refs = 1 feature) |
| 21 | influencer_applications | 1199 | Influencer program applications |
| 22 | active_influencers | 1217 | Verified influencers (10k+ followers) |

### VIP System (2 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 23 | platform_vips | 1237 | VIP members (founders, staff, partners) |
| 24 | first_100_members | 1249 | First 100 signups (free DIAMOND tier) |

### Print Shop (4 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 25 | print_products | 1267 | Printable art products |
| 26 | print_product_options | 1284 | Size/material/finish options |
| 27 | print_orders | 1294 | Print order processing |
| 28 | print_fulfillment_log | 1312 | Order status tracking |

### Physical Marketplace (4 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 29 | physical_products | 1332 | Physical items for sale (eBay-style) |
| 30 | physical_orders | 1356 | Physical product orders |
| 31 | marketplace_disputes | 1378 | Order dispute resolution |
| 32 | seller_verifications | 1392 | Seller trust ratings |

### VR/AR Experiences (2 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 33 | vr_galleries | 1421 | VR art galleries |
| 34 | ar_projects | 1438 | AR filters & effects |

### Game Engine (3 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 35 | game_projects | 1463 | User-created games |
| 36 | game_assets | 1484 | Game asset marketplace |
| 37 | game_leaderboards | 1500 | Game high scores |

---

## PART 4: COMPLETE SOCIAL PLATFORM (87 Tables)

### Profiles & Identity (4 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 38 | profiles | 1613 | User profiles (extends auth.users) |
| 39 | user_badges | 1638 | Achievement badges |
| 40 | verification_requests | 1649 | Identity verification |
| 41 | creator_links | 1665 | Social media links |

### Posts & Content (12 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 42 | posts | 1684 | User posts |
| 43 | post_drafts | 1708 | Scheduled/draft posts |
| 44 | pinned_posts | 1721 | Profile pinned posts |
| 45 | post_edits | 1729 | Post edit history |
| 46 | stories | 1741 | 24-hour stories |
| 47 | story_views | 1755 | Story view tracking |
| 48 | story_highlights | 1768 | Saved story highlights |
| 49 | highlight_stories | 1779 | Stories in highlights |
| 50 | polls | 1789 | Post polls |
| 51 | poll_options | 1800 | Poll choices |
| 52 | poll_votes | 1810 | User poll votes |
| 53 | hashtags | 2048 | Hashtag tracking |
| 54 | post_hashtags | 2055 | Post-hashtag relationships |

### Social Interactions (15 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 55 | likes | 1828 | Post likes |
| 56 | reactions | 1839 | Emoji reactions |
| 57 | comments | 1852 | Post comments |
| 58 | follows | 1869 | User follows |
| 59 | saves | 1882 | Saved posts |
| 60 | collections | 1894 | Post collections |
| 61 | collection_items | 1905 | Posts in collections |
| 62 | blocks | 1916 | Blocked users |
| 63 | muted_users | 1929 | Muted users |
| 64 | close_friends | 1940 | Close friends list |
| 65 | groups | 1953 | User groups |
| 66 | group_members | 1970 | Group membership |
| 67 | group_join_requests | 1979 | Group join requests |
| 68 | group_posts | 1990 | Posts in groups |
| 69 | user_settings | 2065 | User preferences |

### Events (2 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 70 | events | 2005 | User events |
| 71 | event_attendees | 2029 | Event RSVPs |

### Notifications (1 Table)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 72 | notifications | 2079 | User notifications |

### Direct Messages (3 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 73 | conversations | 2099 | DM conversations |
| 74 | conversation_participants | 2105 | Users in conversations |
| 75 | messages | 2113 | Direct messages |

### Live Streaming (3 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 76 | live_streams | 2130 | Live stream sessions |
| 77 | stream_viewers | 2149 | Stream viewer tracking |
| 78 | stream_chat | 2158 | Live stream chat |

### Reports & Moderation (6 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 79 | reports | 2179 | User-submitted reports |
| 80 | moderation_queue | 2200 | Content moderation queue |
| 81 | content_warnings | 2216 | NSFW/sensitive warnings |
| 82 | dmca_claims | 2227 | Copyright claims |
| 83 | banned_words | 2244 | Banned word list |
| 84 | age_restrictions | 2254 | Age-restricted content |

### Subscriptions & Economy (3 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 85 | subscriptions | 2273 | Creator subscriptions |
| 86 | transactions | 2298 | All financial transactions |
| 87 | tips | 2325 | Creator tips |

### Analytics (6 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 88 | analytics_daily | 2346 | Daily user analytics |
| 89 | trending_posts | 2369 | Trending content |
| 90 | trending_topics | 2377 | Trending hashtags/topics |
| 91 | user_recommendations | 2387 | Recommended content |
| 92 | search_history | 2400 | User search history |
| 93 | recently_viewed | 2408 | Recently viewed content |

### Achievements & Referrals (3 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 94 | achievements | 2426 | Achievement definitions |
| 95 | user_achievements | 2438 | User earned achievements |
| 96 | referrals | 2446 | Platform referrals |

### Projects System (7 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 97 | projects | 2467 | Creative projects |
| 98 | project_versions | 2486 | Project version history |
| 99 | project_assets | 2498 | Project files/assets |
| 100 | project_collaborators | 2514 | Project team members |
| 101 | ai_generations | 2525 | AI content generation log |
| 102 | audio_tracks | 2541 | Audio editing tracks |
| 103 | design_layers | 2555 | Design layer system |

### Templates Marketplace (5 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 104 | templates | 2585 | Template marketplace |
| 105 | template_purchases | 2611 | Template purchases |
| 106 | template_reviews | 2621 | Template ratings |
| 107 | template_likes | 2634 | Template likes |
| 108 | template_stats | 2642 | Template analytics |

### NFTs & Digital Collectibles (3 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 109 | nfts | 2668 | NFT definitions |
| 110 | nft_owners | 2692 | NFT ownership history |
| 111 | nft_transactions | 2702 | NFT trades |

### Webhooks & API (4 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 112 | webhooks | 2723 | User webhook configs |
| 113 | webhook_logs | 2737 | Webhook delivery logs |
| 114 | api_keys | 2748 | User API keys |
| 115 | api_usage | 2762 | API usage tracking |

### Support & Help (2 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 116 | support_tickets | 2782 | Support tickets |
| 117 | ticket_messages | 2796 | Ticket conversation |

### Security & Auth (3 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 118 | login_history | 2814 | Login attempt logs |
| 119 | two_factor_auth | 2826 | 2FA settings |
| 120 | active_sessions | 2835 | Active login sessions |

### GDPR & Privacy (4 Tables)
| # | Table Name | Line | Purpose |
|---|------------|------|---------|
| 121 | data_export_requests | 2855 | GDPR data export |
| 122 | account_deletion_requests | 2865 | Account deletion queue |
| 123 | terms_acceptances | 2876 | Terms acceptance log |
| 124 | consent_records | 2883 | User consent tracking |

---

## SUMMARY BY CATEGORY

| Category | Table Count |
|----------|-------------|
| **Crypto & Purchases** | 2 |
| **Book Printing** | 4 |
| **Profile Customization** | 8 |
| **Tier System** | 4 |
| **Referral & Influencer** | 4 |
| **VIP System** | 2 |
| **Print Shop** | 4 |
| **Physical Marketplace** | 4 |
| **VR/AR** | 2 |
| **Game Engine** | 3 |
| **Profiles & Identity** | 4 |
| **Posts & Content** | 12 |
| **Social Interactions** | 15 |
| **Events** | 2 |
| **Notifications** | 1 |
| **Direct Messages** | 3 |
| **Live Streaming** | 3 |
| **Moderation** | 6 |
| **Economy** | 3 |
| **Analytics** | 6 |
| **Achievements** | 3 |
| **Projects** | 7 |
| **Templates** | 5 |
| **NFTs** | 3 |
| **API & Webhooks** | 4 |
| **Support** | 2 |
| **Security** | 3 |
| **GDPR** | 4 |
| **TOTAL** | **123** |

---

## EXECUTION ORDER

1. **Part 0 → Part 1 → Part 2** (Lines 1-915) - Run FIRST
2. **Part 3** (Lines 916-1600) - Run SECOND
3. **Part 4** (Lines 1601-2998) - Run THIRD

---

**Quick Reference: All 123 tables with line numbers for easy navigation.**
