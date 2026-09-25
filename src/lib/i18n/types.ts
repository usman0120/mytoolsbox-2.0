import type { LocaleCode } from "./config";

export interface TranslationDictionary {
  // Navigation
  nav_tools: string;
  nav_apps: string;
  nav_ai: string;
  nav_hubs: string;
  nav_resources: string;
  nav_signin: string;
  nav_search_placeholder: string;

  // Common Actions
  action_upload: string;
  action_download: string;
  action_copy: string;
  action_copied: string;
  action_share: string;
  action_embed: string;
  action_favorite: string;
  action_favorited: string;
  action_all_tools: string;
  action_explore: string;
  action_clear_all: string;
  action_view_all: string;
  action_start_chat: string;
  action_browse_prompts: string;
  action_compare_models: string;
  action_view_personas: string;

  // Badges & Trust
  badge_client_side: string;
  badge_instant: string;
  badge_free: string;
  badge_no_upload: string;
  badge_private: string;
  badge_beta: string;
  badge_pro: string;
  badge_no_signup: string;

  // Homepage Hero & Features
  hero_tag: string;
  hero_title: string;
  hero_subtitle: string;
  hero_cta_tools: string;
  hero_cta_ai: string;
  quick_jobs_title: string;
  categories_title: string;
  cta_title: string;
  cta_desc: string;

  feature_privacy_title: string;
  feature_privacy_desc: string;
  feature_fast_title: string;
  feature_fast_desc: string;
  feature_offline_title: string;
  feature_offline_desc: string;
  feature_free_title: string;
  feature_free_desc: string;

  // Homepage Audience Section
  audience_tag: string;
  audience_title: string;
  audience_subtitle: string;
  aud_students: string;
  aud_students_desc: string;
  aud_developers: string;
  aud_developers_desc: string;
  aud_business: string;
  aud_business_desc: string;
  aud_designers: string;
  aud_designers_desc: string;
  aud_writers: string;
  aud_writers_desc: string;
  aud_researchers: string;
  aud_researchers_desc: string;

  // Homepage AI Suite Section
  ai_credits_badge: string;
  ai_suite_title: string;
  ai_suite_desc: string;
  ai_workspace_btn: string;
  ai_chat_desc: string;
  ai_prompts_desc: string;
  ai_compare_desc: string;
  ai_personas_desc: string;

  // Homepage Popular & Explore
  popular_tag: string;
  popular_title: string;
  popular_desc: string;
  apps_tag: string;
  apps_desc: string;
  categories_tag: string;
  categories_subtext: string;

  // Quick Jobs
  job_merge_pdf: string;
  job_compress_image: string;
  job_format_json: string;
  job_generate_qr: string;
  job_count_words: string;
  job_calculate_percent: string;
  job_convert_case: string;
  job_resize_image: string;

  // Categories
  cat_documents: string;
  cat_images: string;
  cat_developer: string;
  cat_calculators: string;
  cat_writing: string;
  cat_media: string;
  cat_security: string;

  // Tool Page 3 Steps
  how_to_use_title: string;
  step_1_title: string;
  step_1_desc: string;
  step_2_title: string;
  step_2_desc: string;
  step_3_title: string;
  step_3_desc: string;

  // Tool Page Sections
  features_title: string;
  features_subtitle: string;
  privacy_title: string;
  privacy_subtitle: string;
  privacy_p1: string;
  privacy_p2: string;
  faq_title: string;
  related_tools_title: string;
  embed_title: string;
  embed_desc: string;
  embed_copy_btn: string;

  // Tool Detail Extra Specs & Use Cases
  use_cases_title: string;
  use_case_students: string;
  use_case_students_desc: string;
  use_case_developers: string;
  use_case_developers_desc: string;
  use_case_business: string;
  use_case_business_desc: string;
  use_case_daily: string;
  use_case_daily_desc: string;
  spec_specs_title: string;
  spec_in_browser: string;
  spec_in_browser_desc: string;
  spec_no_reg: string;
  spec_no_reg_desc: string;
  spec_cluster_suffix: string;
  spec_cluster_desc: string;
  hub_more_prefix: string;
  hub_more_sub: string;
  hub_explore_btn_prefix: string;
  feature_no_signup_extra: string;
  feature_unlimited_extra: string;

  // Tools Directory
  tools_page_title: string;
  tools_page_subtitle: string;
  tools_search_placeholder: string;
  tools_all_categories: string;
  tools_no_results: string;
  tools_filtered_by: string;
  tools_results_count: string;

  // Apps Directory
  apps_page_title: string;
  apps_page_subtitle: string;
  apps_search_placeholder: string;
  apps_launch: string;
  apps_no_results: string;

  // AI Suite
  ai_page_title: string;
  ai_page_subtitle: string;
  ai_new_chat: string;
  ai_prompt_library: string;
  ai_compare_models: string;
  ai_personas: string;

  // Search Page
  search_title: string;
  search_placeholder: string;
  search_all: string;
  search_tools_tab: string;
  search_apps_tab: string;
  search_no_results: string;
  search_try_again: string;

  // Tool Engine
  engine_loading: string;
  engine_coming_soon: string;
  engine_under_dev: string;

  // Footer
  footer_tagline: string;
  footer_platform: string;
  footer_ai_suite: string;
  footer_categories: string;
  footer_company: string;
  footer_about: string;
  footer_contact: string;
  footer_privacy: string;
  footer_terms: string;
  footer_rights: string;
  footer_built_with: string;

  // Auth & User Menu
  auth_signin: string;
  auth_signup: string;
  auth_signout: string;
  auth_reset_pwd: string;
  auth_google: string;
  auth_guest: string;
  auth_or_email: string;
  auth_email: string;
  auth_password: string;
  auth_forgot_pwd: string;
  auth_guest_title: string;
  auth_guest_desc: string;
  auth_profile: string;
  auth_favorites: string;
  auth_history: string;
  auth_settings: string;
  auth_upgrade: string;
  auth_resets_in: string;
  auth_login_required: string;
  auth_login_desc: string;

  // Navbar Submenus
  nav_settings_profile: string;
  nav_ai_chat_sub: string;
  nav_ai_prompts_sub: string;
  nav_ai_compare_sub: string;
  nav_ai_personas_sub: string;

  // Tool Card & Extra Badges
  badge_soon: string;
  badge_account_required: string;
  badge_standalone: string;
  badge_studio_mode: string;
  badge_exit_studio: string;

  // Apps Detail Page
  apps_capabilities: string;
  apps_architecture: string;
  apps_faqs: string;
  apps_features_title: string;
  apps_features_desc: string;
  apps_zero_leak_title: string;
  apps_zero_leak_desc: string;
  apps_ai_intel_title: string;
  apps_ai_intel_desc: string;
  apps_audience_title: string;

  // Hubs Pages
  hubs_title: string;
  hubs_subtitle: string;
  hubs_tools_count: string;
  hubs_apps_count: string;
  hubs_total_count: string;
  hubs_explore_btn: string;
  hubs_back: string;

  // Favorites & History Pages
  fav_title: string;
  fav_subtitle: string;
  fav_empty: string;
  fav_browse: string;
  fav_remove: string;
  hist_title: string;
  hist_subtitle: string;
  hist_clear: string;
  hist_empty: string;
  hist_cleared: string;

  // Contact Page
  contact_title: string;
  contact_subtitle: string;
  contact_name: string;
  contact_email: string;
  contact_type: string;
  contact_message: string;
  contact_send: string;
  contact_sent: string;

  // Settings Page
  settings_title: string;
  settings_subtitle: string;
  settings_tab_profile: string;
  settings_tab_account: string;
  settings_save: string;

  // About Page
  about_title: string;
  about_mission_title: string;
  about_mission_desc: string;
  about_privacy_title: string;
  about_privacy_desc: string;
  about_free_title: string;
  about_free_desc: string;
  about_offline_title: string;
  about_offline_desc: string;

  // Search Command & Extra Badges
  search_see_all: string;
  search_try_different: string;
  badge_app: string;
  badge_tool: string;

  // Offline & Processing Status
  status_offline: string;
  status_back_online: string;
  status_works_offline: string;
  status_syncing: string;
  status_ready: string;
  status_uploading: string;
  status_processing: string;
  status_done: string;
  status_error: string;
  status_cancelled: string;
  status_unsupported: string;
  status_limit_exceeded: string;

  // Account Page
  account_title: string;
  account_guest_sub: string;
  account_user_sub: string;
  account_plan_title: string;
  account_plan_guest_desc: string;
  account_plan_free_desc: string;
  account_plan_pro_desc: string;
  account_upgrade_btn: string;
  account_details_title: string;
  account_email_label: string;
  account_provider_label: string;
  account_created_label: string;
  account_last_signin_label: string;
  account_quick_links_title: string;
  account_guest_notice: string;

  // Dashboard Page
  dash_welcome: string;
  dash_subtitle: string;
  dash_settings_title: string;
  dash_settings_desc: string;
  dash_favorites_title: string;
  dash_favorites_desc: string;
  dash_history_title: string;
  dash_history_desc: string;
  dash_all_tools_title: string;
  dash_all_tools_desc: string;
  dash_ai_title: string;
  dash_ai_desc: string;

  // Resources Page
  resources_title: string;
  resources_subtitle: string;
  resources_search_placeholder: string;
  resources_tab_guides: string;
  resources_tab_templates: string;
  resources_tab_cheatsheets: string;
  resources_tab_faqs: string;
  resources_cat_all: string;
  resources_quick_preview: string;
  resources_read_full: string;
  resources_download: string;
  resources_copy: string;
  resources_preview: string;
  resources_back: string;
  resources_share: string;
  resources_takeaways: string;
  resources_feedback_prompt: string;

  // AI Subnav & Pages
  ai_subnav_title: string;
  ai_subnav_subtitle: string;
  ai_subnav_badge: string;
  ai_subnav_free_credits: string;
  ai_compare_title: string;
  ai_compare_subtitle: string;
  ai_personas_title: string;
  ai_personas_subtitle: string;
  ai_prompts_title: string;
  ai_prompts_subtitle: string;

  // Legal (Privacy & Terms)
  privacy_page_title: string;
  privacy_page_subtitle: string;
  terms_page_title: string;
  terms_page_subtitle: string;
  legal_last_updated: string;

  // 404 Not Found
  not_found_title: string;
  not_found_desc: string;
  not_found_btn: string;
}

