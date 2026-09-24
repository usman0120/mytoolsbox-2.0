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

  // Badges & Trust
  badge_client_side: string;
  badge_instant: string;
  badge_free: string;
  badge_no_upload: string;
  badge_private: string;

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

  // Homepage
  hero_tag: string;
  hero_title: string;
  hero_subtitle: string;
  hero_cta_tools: string;
  hero_cta_ai: string;
  quick_jobs_title: string;
  categories_title: string;
  cta_title: string;
  cta_desc: string;

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

  // Tools Directory
  tools_page_title: string;
  tools_page_subtitle: string;
  tools_search_placeholder: string;
  tools_all_categories: string;
  tools_no_results: string;

  // Apps Directory
  apps_page_title: string;
  apps_page_subtitle: string;
  apps_launch: string;

  // AI Suite
  ai_page_title: string;
  ai_page_subtitle: string;
  ai_new_chat: string;
  ai_prompt_library: string;
  ai_compare_models: string;
  ai_personas: string;

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
}

export const TRANSLATIONS: Record<LocaleCode, TranslationDictionary> = {
  en: {
    nav_tools: "Tools",
    nav_apps: "Apps",
    nav_ai: "AI Suite",
    nav_hubs: "Hubs",
    nav_resources: "Resources",
    nav_signin: "Sign in",
    nav_search_placeholder: "Search tools, keywords (e.g. merge pdf, compress image)...",

    action_upload: "Upload File",
    action_download: "Download",
    action_copy: "Copy",
    action_copied: "Copied!",
    action_share: "Share",
    action_embed: "Embed",
    action_favorite: "Favorite",
    action_favorited: "Favorited",
    action_all_tools: "All Tools",
    action_explore: "Explore",

    badge_client_side: "100% Client-Side",
    badge_instant: "Instant Speed",
    badge_free: "Free Forever",
    badge_no_upload: "Zero Server Uploads",
    badge_private: "Private & Secure",

    how_to_use_title: "How to Use in 3 Easy Steps",
    step_1_title: "Upload or Input Data",
    step_1_desc: "Select or drop your files directly into the browser. All processing occurs locally on your machine.",
    step_2_title: "Configure & Process",
    step_2_desc: "Adjust settings and preferences. Calculations and transformations execute in milliseconds.",
    step_3_title: "Download or Copy Result",
    step_3_desc: "Inspect your output and export or download immediately with no watermarks and full privacy.",

    features_title: "Key Features & Capabilities",
    features_subtitle: "Engineered for speed, accuracy, and absolute data protection.",
    privacy_title: "Why Client-Side Privacy Matters",
    privacy_subtitle: "Your data never leaves your device — guaranteed by modern browser sandboxing.",
    privacy_p1: "Unlike conventional web converters that upload sensitive documents to remote cloud servers, MyToolsBox processes your files directly inside your browser memory using HTML5, WebAssembly, and Canvas technologies.",
    privacy_p2: "No data is transmitted over the internet or retained on servers. When you close or refresh this tab, your files vanish completely, providing GDPR compliance and peace of mind.",
    faq_title: "Frequently Asked Questions",
    related_tools_title: "Related Tools You May Need",
    embed_title: "Embed This Tool On Your Website",
    embed_desc: "Copy and paste this HTML snippet to add this free interactive utility directly into your blog, documentation, or intranet.",
    embed_copy_btn: "Copy Embed Snippet",

    hero_tag: "The Free In-Browser Utility Platform",
    hero_title: "Useful things for everyday work, study & creation",
    hero_subtitle: "Over 150+ free, fast, and secure tools. Process documents, media, code, calculations, and daily jobs directly in your browser with zero data uploads.",
    hero_cta_tools: "Explore All Tools",
    hero_cta_ai: "Try AI Assistant",
    quick_jobs_title: "Quick Jobs",
    categories_title: "Browse by Category",
    cta_title: "Ready to get things done?",
    cta_desc: "Start using any tool instantly. Everything runs in your browser — private, fast, and free.",

    job_merge_pdf: "Merge PDFs",
    job_compress_image: "Compress Image",
    job_format_json: "Format JSON",
    job_generate_qr: "Generate QR",
    job_count_words: "Count Words",
    job_calculate_percent: "Calculate %",
    job_convert_case: "Convert Case",
    job_resize_image: "Resize Image",

    cat_documents: "Documents",
    cat_images: "Images",
    cat_developer: "Developer",
    cat_calculators: "Calculators",
    cat_writing: "Writing",
    cat_media: "Media",
    cat_security: "Security",

    tools_page_title: "All Free Online Tools",
    tools_page_subtitle: "Explore 150+ client-side utilities. Fast, free, and secure.",
    tools_search_placeholder: "Search tools by name, action, or keyword...",
    tools_all_categories: "All Categories",
    tools_no_results: "No tools found matching your search.",

    apps_page_title: "Interactive AI & Smart Web Apps",
    apps_page_subtitle: "Next-generation in-browser applications powered by client compute and multi-model AI.",
    apps_launch: "Launch App",

    ai_page_title: "AI Workspace Suite",
    ai_page_subtitle: "Chat, brainstorm, code, and solve problems with leading AI models.",
    ai_new_chat: "New Chat",
    ai_prompt_library: "Prompt Library (160+)",
    ai_compare_models: "Compare Models",
    ai_personas: "Personas & Tools",

    footer_tagline: "Free online tools and next-gen AI workspace for everyday tasks. Private, fast, and multi-provider.",
    footer_platform: "Platform",
    footer_ai_suite: "AI Suite",
    footer_categories: "Categories",
    footer_company: "Company",
    footer_about: "About",
    footer_contact: "Contact",
    footer_privacy: "Privacy Policy",
    footer_terms: "Terms of Service",
    footer_rights: "All rights reserved.",
    footer_built_with: "Built for everyday creators & developers worldwide.",
  },

  es: {
    nav_tools: "Herramientas",
    nav_apps: "Aplicaciones",
    nav_ai: "Suite IA",
    nav_hubs: "Centros",
    nav_resources: "Recursos",
    nav_signin: "Iniciar sesión",
    nav_search_placeholder: "Buscar herramientas (ej. unir pdf, comprimir imagen)...",

    action_upload: "Subir Archivo",
    action_download: "Descargar",
    action_copy: "Copiar",
    action_copied: "¡Copiado!",
    action_share: "Compartir",
    action_embed: "Incrustar",
    action_favorite: "Favorito",
    action_favorited: "Guardado",
    action_all_tools: "Todas las Herramientas",
    action_explore: "Explorar",

    badge_client_side: "100% En el Navegador",
    badge_instant: "Velocidad Instantánea",
    badge_free: "Gratis Para Siempre",
    badge_no_upload: "Sin Subir al Servidor",
    badge_private: "Privado y Seguro",

    how_to_use_title: "Cómo usar en 3 sencillos pasos",
    step_1_title: "Sube o Introduce Datos",
    step_1_desc: "Selecciona o arrastra tus archivos directamente al navegador. Todo el procesamiento se realiza localmente en tu equipo.",
    step_2_title: "Configura y Procesa",
    step_2_desc: "Ajusta las opciones y parámetros. Los cálculos y transformaciones se completan en milisegundos.",
    step_3_title: "Descarga o Copia el Resultado",
    step_3_desc: "Revisa el resultado y descárgalo o cópialo de inmediato sin marcas de agua y con total privacidad.",

    features_title: "Características y Capacidades Principales",
    features_subtitle: "Diseñado para máxima velocidad, precisión y protección absoluta de tus datos.",
    privacy_title: "¿Por qué la privacidad local es superior?",
    privacy_subtitle: "Tus datos nunca salen de tu dispositivo — garantizado por el aislamiento del navegador.",
    privacy_p1: "A diferencia de los convertidores web tradicionales que suben tus documentos a servidores remotos, MyToolsBox procesa todo en la memoria de tu navegador con WebAssembly y Canvas.",
    privacy_p2: "No se transmiten archivos por internet. Al cerrar o recargar esta pestaña, los archivos desaparecen inmediatamente.",
    faq_title: "Preguntas Frecuentes",
    related_tools_title: "Herramientas Relacionadas",
    embed_title: "Incrusta Esta Herramienta en tu Web",
    embed_desc: "Copia este código HTML para agregar esta herramienta interactiva gratuita en tu blog o sitio web.",
    embed_copy_btn: "Copiar Código de Incrustación",

    hero_tag: "La Plataforma Gratuita en el Navegador",
    hero_title: "Herramientas útiles para tu trabajo diario, estudio y creación",
    hero_subtitle: "Más de 150 herramientas gratuitas, rápidas y seguras. Procesa PDFs, imágenes, código, cálculos y tareas cotidianas sin subir datos a servidores.",
    hero_cta_tools: "Explorar Herramientas",
    hero_cta_ai: "Probar Asistente IA",
    quick_jobs_title: "Tareas Rápidas",
    categories_title: "Explorar por Categoría",
    cta_title: "¿Listo para empezar?",
    cta_desc: "Utiliza cualquier herramienta al instante. Todo funciona en tu navegador: privado, rápido y gratis.",

    job_merge_pdf: "Unir PDFs",
    job_compress_image: "Comprimir Imagen",
    job_format_json: "Formatear JSON",
    job_generate_qr: "Crear Código QR",
    job_count_words: "Contar Palabras",
    job_calculate_percent: "Calcular %",
    job_convert_case: "Cambiar Mayúsculas",
    job_resize_image: "Redimensionar Imagen",

    cat_documents: "Documentos",
    cat_images: "Imágenes",
    cat_developer: "Desarrollo",
    cat_calculators: "Calculadoras",
    cat_writing: "Escritura",
    cat_media: "Multimedia",
    cat_security: "Seguridad",

    tools_page_title: "Todas las Herramientas Gratuitas",
    tools_page_subtitle: "Descubre más de 150 utilidades cliente. Rápidas, gratuitas y privadas.",
    tools_search_placeholder: "Buscar herramientas por nombre o palabra clave...",
    tools_all_categories: "Todas las Categorías",
    tools_no_results: "No se encontraron herramientas que coincidan con tu búsqueda.",

    apps_page_title: "Aplicaciones Web Inteligentes e IA",
    apps_page_subtitle: "Herramientas de próxima generación ejecutadas en tu navegador con inteligencia artificial.",
    apps_launch: "Abrir Aplicación",

    ai_page_title: "Suite de Asistentes IA",
    ai_page_subtitle: "Chatea, analiza, programa y escribe con los mejores modelos de inteligencia artificial.",
    ai_new_chat: "Nuevo Chat",
    ai_prompt_library: "Biblioteca de Prompts (160+)",
    ai_compare_models: "Comparar Modelos",
    ai_personas: "Personalidades y Asistentes",

    footer_tagline: "Herramientas online gratuitas y suite de IA para tus tareas diarias. Privadas, rápidas y seguras.",
    footer_platform: "Plataforma",
    footer_ai_suite: "Suite IA",
    footer_categories: "Categorías",
    footer_company: "Empresa",
    footer_about: "Sobre Nosotros",
    footer_contact: "Contacto",
    footer_privacy: "Política de Privacidad",
    footer_terms: "Términos de Servicio",
    footer_rights: "Todos los derechos reservados.",
    footer_built_with: "Creado para creadores y desarrolladores en todo el mundo.",
  },

  ur: {
    nav_tools: "ٹولز",
    nav_apps: "ایپس",
    nav_ai: "اے آئی سویٹ",
    nav_hubs: "ہبز",
    nav_resources: "وسائل",
    nav_signin: "لاگ ان",
    nav_search_placeholder: "ٹولز یا کی ورڈ تلاش کریں (مثلاً پی ڈی ایف جوڑیں، تصویر کمپریس کریں)...",

    action_upload: "فائل اپ لوڈ کریں",
    action_download: "ڈاؤن لوڈ کریں",
    action_copy: "کاپی کریں",
    action_copied: "کاپی ہو گیا!",
    action_share: "شیئر کریں",
    action_embed: "ایمبیڈ کریں",
    action_favorite: "پسندیدہ بنائیں",
    action_favorited: "محفوظ ہو گیا",
    action_all_tools: "تمام ٹولز",
    action_explore: "تلاش کریں",

    badge_client_side: "100% براؤزر پر محفوظ",
    badge_instant: "فوری اور تیز رفتار",
    badge_free: "ہمیشہ کے لیے مفت",
    badge_no_upload: "کوئی فائل سرور پر نہیں جاتی",
    badge_private: "مکمل رازداری اور تحفظ",

    how_to_use_title: "3 آسان مراحل میں استعمال کرنے کا طریقہ",
    step_1_title: "فائل یا ڈیٹا فراہم کریں",
    step_1_desc: "اپنی فائلیں براہ راست براؤزر میں شامل کریں۔ تمام پروسیسنگ آپ کے اپنے کمپیوٹر یا موبائل پر ہوتی ہے۔",
    step_2_title: "ترتیبات اور پروسیسنگ",
    step_2_desc: "اپنی ضرورت کے مطابق آپشنز منتخب کریں۔ تبادلہ اور حساب چند ملی سیکنڈز میں مکمل ہوتا ہے۔",
    step_3_title: "نتیجہ ڈاؤن لوڈ یا کاپی کریں",
    step_3_desc: "تیار شدہ فائل بغیر واٹر مارک اور مکمل رازداری کے ساتھ فوراً محفوظ کریں۔",

    features_title: "نمایاں خصوصیات اور صلاحیتیں",
    features_subtitle: "تیز رفتار، درست نتائج اور ڈیٹا کے مکمل تحفظ کے لیے خصوصی ڈیزائن۔",
    privacy_title: "براؤزر پر پروسیسنگ کیوں ضروری ہے؟",
    privacy_subtitle: "آپ کا ڈیٹا آپ کے آلے سے باہر کبھی نہیں جاتا۔",
    privacy_p1: "دوسری روایتی ویب سائٹس کے برعکس جو آپ کی فائلیں سرورز پر اپ لوڈ کرتی ہیں، MyToolsBox آپ کی فائلز کو مکمل طور پر آپ کے براؤزر کے اندر پروسیس کرتا ہے۔",
    privacy_p2: "انٹرنیٹ پر کوئی ذاتی ڈیٹا ٹرانسمٹ نہیں ہوتا۔ ٹیب بند کرتے ہی تمام فائلز خودبخود حذف ہو جاتی ہیں۔",
    faq_title: "اکثر پوچھے جانے والے سوالات",
    related_tools_title: "دیگر مفید ٹولز",
    embed_title: "یہ ٹول اپنی ویب سائٹ پر لگائیں",
    embed_desc: "یہ مفت انٹرایکٹو ٹول اپنے بلاگ یا ویب سائٹ پر شامل کرنے کے لیے ایچ ٹی ایم ایل کوڈ کاپی کریں۔",
    embed_copy_btn: "ایمبیڈ کوڈ کاپی کریں",

    hero_tag: "مفت ان-براؤزر ٹولز پلیٹ فارم",
    hero_title: "روزمرہ کے کام، تعلیم اور تخلیقی ضروریات کے لیے بہترین ٹولز",
    hero_subtitle: "150 سے زائد مفت، تیز رفتار اور محفوظ ٹولز۔ پی ڈی ایف، تصاویر، کوڈنگ، حساب کتاب اور روزانہ کے کام بغیر کسی فائل اپ لوڈ کے فوری سرانجام دیں۔",
    hero_cta_tools: "تمام ٹولز دیکھیں",
    hero_cta_ai: "اے آئی اسسٹنٹ آزمائیں",
    quick_jobs_title: "فوری کام",
    categories_title: "کیٹیگری کے لحاظ سے براؤز کریں",
    cta_title: "کیا آپ کام شروع کرنے کے لیے تیار ہیں؟",
    cta_desc: "کوئی بھی ٹول فوراً استعمال کریں۔ ہر چیز مکمل رازداری اور مفت میں آپ کے براؤزر میں چلتی ہے۔",

    job_merge_pdf: "پی ڈی ایف جوڑیں",
    job_compress_image: "تصویر کمپریس کریں",
    job_format_json: "جے ایس او این فارمیٹ کریں",
    job_generate_qr: "کیو آر کوڈ بنائیں",
    job_count_words: "الفاظ گنیں",
    job_calculate_percent: "فیصد حساب کریں",
    job_convert_case: "کیس تبدیل کریں",
    job_resize_image: "سائز تبدیل کریں",

    cat_documents: "دستاویزات",
    cat_images: "تصاویر",
    cat_developer: "ڈیولپر",
    cat_calculators: "کیلکولیٹرز",
    cat_writing: "تحریر و متن",
    cat_media: "میڈیا",
    cat_security: "سیکیورٹی",

    tools_page_title: "تمام مفت آن لائن ٹولز",
    tools_page_subtitle: "150 سے زیادہ کلائنٹ سائیڈ یوٹیلیٹیز۔ تیز، مفت اور محفوظ۔",
    tools_search_placeholder: "نام یا کی ورڈ کے ذریعے ٹول تلاش کریں...",
    tools_all_categories: "تمام کیٹیگریز",
    tools_no_results: "آپ کی تلاش کے مطابق کوئی ٹول نہیں ملا۔",

    apps_page_title: "سمارٹ اور انٹرایکٹو اے آئی ایپس",
    apps_page_subtitle: "جدید ویب ایپس جو کلائنٹ کمپیوٹ اور جدید اے آئی ماڈلز پر چلتی ہیں۔",
    apps_launch: "ایپ کھولیں",

    ai_page_title: "اے آئی ورک اسپیس سویٹ",
    ai_page_subtitle: "دنیا کے بہترین اے آئی ماڈلز کے ساتھ چیٹ کریں، کوڈ لکھیں اور مسائل حل کریں۔",
    ai_new_chat: "نئی چیٹ",
    ai_prompt_library: "پرامپٹ لائبریری (160+)",
    ai_compare_models: "ماڈلز کا موازنہ",
    ai_personas: "اسسٹنٹس اور پرسنز",

    footer_tagline: "روزمرہ کاموں کے لیے مفت آن لائن ٹولز اور جدید اے آئی ورک اسپیس۔ نجی، تیز رفتار اور محفوظ۔",
    footer_platform: "پلیٹ فارم",
    footer_ai_suite: "اے آئی سویٹ",
    footer_categories: "کیٹیگریز",
    footer_company: "کمپنی",
    footer_about: "ہمارے بارے میں",
    footer_contact: "رابطہ",
    footer_privacy: "پرائیویسی پالیسی",
    footer_terms: "شرائط و ضوابط",
    footer_rights: "جملہ حقوق محفوظ ہیں۔",
    footer_built_with: "دنیا بھر کے تخلیق کاروں اور ڈیولپرز کے لیے محبت سے تیار کردہ۔",
  },

  fr: {
    nav_tools: "Outils",
    nav_apps: "Applications",
    nav_ai: "Suite IA",
    nav_hubs: "Hubs",
    nav_resources: "Ressources",
    nav_signin: "Connexion",
    nav_search_placeholder: "Rechercher des outils (ex. fusionner pdf, compresser image)...",

    action_upload: "Téléverser un Fichier",
    action_download: "Télécharger",
    action_copy: "Copier",
    action_copied: "Copié !",
    action_share: "Partager",
    action_embed: "Intégrer",
    action_favorite: "Favori",
    action_favorited: "Enregistré",
    action_all_tools: "Tous les Outils",
    action_explore: "Explorer",

    badge_client_side: "100% Côté Client",
    badge_instant: "Vitesse Instantanée",
    badge_free: "Gratuit Pour Toujours",
    badge_no_upload: "Aucun Envoi sur Serveur",
    badge_private: "Privé et Sécurisé",

    how_to_use_title: "Comment utiliser en 3 étapes faciles",
    step_1_title: "Importez vos Données",
    step_1_desc: "Glissez ou sélectionnez vos fichiers dans le navigateur. Tout le traitement reste local sur votre machine.",
    step_2_title: "Configurez et Traitez",
    step_2_desc: "Ajustez vos paramètres. Les calculs et conversions s'exécutent en quelques millisecondes.",
    step_3_title: "Téléchargez le Résultat",
    step_3_desc: "Vérifiez le résultat et exportez-le sans filigrane avec une confidentialité totale.",

    features_title: "Fonctionnalités Principales",
    features_subtitle: "Conçu pour la vitesse, la précision et la protection absolue de vos données.",
    privacy_title: "Pourquoi la confidentialité locale compte",
    privacy_subtitle: "Vos données ne quittent jamais votre appareil — garanti par votre navigateur.",
    privacy_p1: "Contrairement aux convertisseurs classiques qui envoient vos fichiers sur des serveurs distants, MyToolsBox traite tout dans la mémoire de votre navigateur.",
    privacy_p2: "Aucune donnée n'est transmise sur internet. À la fermeture de l'onglet, tous les fichiers sont instantanément effacés.",
    faq_title: "Foire Aux Questions",
    related_tools_title: "Outils Similaires",
    embed_title: "Intégrez cet Outil sur Votre Site",
    embed_desc: "Copiez et collez cet extrait HTML pour intégrer cet outil gratuit directement sur votre blog ou site web.",
    embed_copy_btn: "Copier le Code d'Intégration",

    hero_tag: "La Plateforme d'Outils Gratuits en Ligne",
    hero_title: "Des outils indispensables pour le travail, les études et la création",
    hero_subtitle: "Plus de 150 outils gratuits, rapides et sécurisés. Traitez vos PDFs, images, code et calculs sans jamais téléverser vos fichiers.",
    hero_cta_tools: "Découvrir les Outils",
    hero_cta_ai: "Essayer l'Assistant IA",
    quick_jobs_title: "Tâches Rapides",
    categories_title: "Parcourir par Catégorie",
    cta_title: "Prêt à commencer ?",
    cta_desc: "Utilisez n'importe quel outil instantanément. Tout fonctionne dans votre navigateur : rapide, privé et gratuit.",

    job_merge_pdf: "Fusionner PDFs",
    job_compress_image: "Compresser Image",
    job_format_json: "Formater JSON",
    job_generate_qr: "Créer un QR Code",
    job_count_words: "Compter les Mots",
    job_calculate_percent: "Calculer %",
    job_convert_case: "Changer la Casse",
    job_resize_image: "Redimensionner Image",

    cat_documents: "Documents",
    cat_images: "Images",
    cat_developer: "Développeur",
    cat_calculators: "Calculatrices",
    cat_writing: "Rédaction",
    cat_media: "Multimédia",
    cat_security: "Sécurité",

    tools_page_title: "Tous les Outils Gratuits en Ligne",
    tools_page_subtitle: "Explorez plus de 150 utilitaires client. Rapides, gratuits et sécurisés.",
    tools_search_placeholder: "Rechercher un outil par nom ou mot-clé...",
    tools_all_categories: "Toutes les Catégories",
    tools_no_results: "Aucun outil trouvé correspondant à votre recherche.",

    apps_page_title: "Applications Web Intelligentes & IA",
    apps_page_subtitle: "Des outils de nouvelle génération exécutés dans votre navigateur.",
    apps_launch: "Lancer l'Application",

    ai_page_title: "Suite Espace de Travail IA",
    ai_page_subtitle: "Discutez, codez, résolvez des problèmes et rédigez avec des modèles d'IA de pointe.",
    ai_new_chat: "Nouvelle Discussion",
    ai_prompt_library: "Bibliothèque de Prompts (160+)",
    ai_compare_models: "Comparer les Modèles",
    ai_personas: "Personnalités & Outils",

    footer_tagline: "Outils en ligne gratuits et espace IA pour vos tâches quotidiennes. Privé, rapide et sécurisé.",
    footer_platform: "Plateforme",
    footer_ai_suite: "Suite IA",
    footer_categories: "Catégories",
    footer_company: "Entreprise",
    footer_about: "À Propos",
    footer_contact: "Contact",
    footer_privacy: "Politique de Confidentialité",
    footer_terms: "Conditions d'Utilisation",
    footer_rights: "Tous droits réservés.",
    footer_built_with: "Créé avec soin pour les créateurs et développeurs du monde entier.",
  },

  de: {
    nav_tools: "Tools",
    nav_apps: "Apps",
    nav_ai: "KI-Suite",
    nav_hubs: "Hubs",
    nav_resources: "Ressourcen",
    nav_signin: "Anmelden",
    nav_search_placeholder: "Tools durchsuchen (z. B. PDF zusammenfügen, Bild komprimieren)...",

    action_upload: "Datei hochladen",
    action_download: "Herunterladen",
    action_copy: "Kopieren",
    action_copied: "Kopiert!",
    action_share: "Teilen",
    action_embed: "Einbetten",
    action_favorite: "Favorisieren",
    action_favorited: "Gespeichert",
    action_all_tools: "Alle Tools",
    action_explore: "Erkunden",

    badge_client_side: "100% Im Browser",
    badge_instant: "Sofortige Geschwindigkeit",
    badge_free: "Dauerhaft Kostenlos",
    badge_no_upload: "Kein Server-Upload",
    badge_private: "Privat & Sicher",

    how_to_use_title: "In 3 einfachen Schritten verwenden",
    step_1_title: "Dateien Auswählen",
    step_1_desc: "Wählen oder ziehen Sie Ihre Dateien direkt in den Browser. Alle Berechnungen erfolgen lokal auf Ihrem Computer.",
    step_2_title: "Anpassen & Verarbeiten",
    step_2_desc: "Passen Sie die Einstellungen an. Die Ausführung erfolgt in wenigen Millisekunden.",
    step_3_title: "Ergebnis Herunterladen",
    step_3_desc: "Prüfen Sie das Ergebnis und laden Sie es sofort herunter — ohne Wasserzeichen und mit vollem Datenschutz.",

    features_title: "Wichtigste Funktionen",
    features_subtitle: "Entwickelt für maximale Geschwindigkeit, Präzision und Datensicherheit.",
    privacy_title: "Warum lokaler Datenschutz entscheidend ist",
    privacy_subtitle: "Ihre Daten verlassen Ihr Gerät nie — garantiert durch moderne Browser-Sandboxes.",
    privacy_p1: "Im Gegensatz zu herkömmlichen Plattformen, die Ihre Dokumente auf fremde Server laden, verarbeitet MyToolsBox Ihre Dateien lokal im Arbeitsspeicher.",
    privacy_p2: "Keine Datenübertragung über das Internet. Beim Schließen des Tabs werden alle temporären Daten sofort gelöscht.",
    faq_title: "Häufig gestellte Fragen",
    related_tools_title: "Ähnliche nützliche Tools",
    embed_title: "Dieses Tool auf Ihrer Website einbetten",
    embed_desc: "Kopieren Sie diesen HTML-Code, um dieses interaktive Tool direkt in Ihre Website oder Ihren Blog einzubinden.",
    embed_copy_btn: "Einbettungscode kopieren",

    hero_tag: "Die kostenlose Browser-Tools-Plattform",
    hero_title: "Nützliche Werkzeuge für Alltag, Studium & Beruf",
    hero_subtitle: "Über 150 kostenlose, schnelle und sichere Tools. PDFs, Bilder, Code und Berechnungen direkt im Browser ohne Server-Uploads verarbeiten.",
    hero_cta_tools: "Alle Tools ansehen",
    hero_cta_ai: "KI-Assistent testen",
    quick_jobs_title: "Schnellaufgaben",
    categories_title: "Nach Kategorie durchsuchen",
    cta_title: "Bereit loszulegen?",
    cta_desc: "Starten Sie sofort mit jedem Tool. Alles läuft lokal in Ihrem Browser — privat, schnell und kostenlos.",

    job_merge_pdf: "PDFs verbinden",
    job_compress_image: "Bild verkleinern",
    job_format_json: "JSON formatieren",
    job_generate_qr: "QR-Code erstellen",
    job_count_words: "Wörter zählen",
    job_calculate_percent: "Prozent rechnen",
    job_convert_case: "Schreibung ändern",
    job_resize_image: "Bildgröße anpassen",

    cat_documents: "Dokumente",
    cat_images: "Bilder",
    cat_developer: "Entwickler",
    cat_calculators: "Rechner",
    cat_writing: "Texte & Schreiben",
    cat_media: "Medien",
    cat_security: "Sicherheit",

    tools_page_title: "Alle kostenlosen Online-Tools",
    tools_page_subtitle: "Entdecken Sie über 150 browserbasierte Werkzeuge. Schnell, kostenlos und sicher.",
    tools_search_placeholder: "Tools nach Name oder Begriff suchen...",
    tools_all_categories: "Alle Kategorien",
    tools_no_results: "Keine Tools gefunden, die Ihrer Suche entsprechen.",

    apps_page_title: "Intelligente Web-Apps & KI",
    apps_page_subtitle: "Web-Apps der nächsten Generation direkt in Ihrem Browser.",
    apps_launch: "App starten",

    ai_page_title: "KI-Arbeitsplatz Suite",
    ai_page_subtitle: "Chatten, programmieren und Probleme lösen mit führenden KI-Modellen.",
    ai_new_chat: "Neuer Chat",
    ai_prompt_library: "Prompt-Bibliothek (160+)",
    ai_compare_models: "Modelle vergleichen",
    ai_personas: "Personas & Assistenten",

    footer_tagline: "Kostenlose Online-Tools und KI-Workspace für den Alltag. Privat, schnell und sicher.",
    footer_platform: "Plattform",
    footer_ai_suite: "KI-Suite",
    footer_categories: "Kategorien",
    footer_company: "Unternehmen",
    footer_about: "Über uns",
    footer_contact: "Kontakt",
    footer_privacy: "Datenschutz",
    footer_terms: "Nutzungsbedingungen",
    footer_rights: "Alle Rechte vorbehalten.",
    footer_built_with: "Erstellt für Kreative und Entwickler weltweit.",
  },

  pt: {
    nav_tools: "Ferramentas",
    nav_apps: "Aplicativos",
    nav_ai: "Suíte IA",
    nav_hubs: "Hubs",
    nav_resources: "Recursos",
    nav_signin: "Entrar",
    nav_search_placeholder: "Pesquisar ferramentas (ex: juntar pdf, comprimir imagem)...",

    action_upload: "Enviar Arquivo",
    action_download: "Baixar",
    action_copy: "Copiar",
    action_copied: "Copiado!",
    action_share: "Compartilhar",
    action_embed: "Incorporar",
    action_favorite: "Favorito",
    action_favorited: "Salvo",
    action_all_tools: "Todas as Ferramentas",
    action_explore: "Explorar",

    badge_client_side: "100% No Navegador",
    badge_instant: "Velocidade Instantânea",
    badge_free: "Grátis Para Sempre",
    badge_no_upload: "Zero Envio para Servidores",
    badge_private: "Privado e Seguro",

    how_to_use_title: "Como usar em 3 passos fáceis",
    step_1_title: "Selecione ou Insira os Dados",
    step_1_desc: "Arraste ou escolha seus arquivos direto no navegador. Todo o processamento ocorre no seu computador.",
    step_2_title: "Configure e Processe",
    step_2_desc: "Ajuste os parâmetros desejados. As transformações são executadas em milissegundos.",
    step_3_title: "Baixe ou Copie o Resultado",
    step_3_desc: "Confira o resultado e baixe imediatamente sem marcas d'água e com total privacidade.",

    features_title: "Principais Recursos e Capacidades",
    features_subtitle: "Projetado para máxima velocidade, precisão e privacidade absoluta.",
    privacy_title: "Por que a privacidade local é fundamental",
    privacy_subtitle: "Seus dados nunca saem do seu dispositivo — garantido pelo isolamento do navegador.",
    privacy_p1: "Ao contrário dos conversores tradicionais que enviam seus arquivos para servidores desconhecidos, o MyToolsBox processa tudo diretamente no seu navegador.",
    privacy_p2: "Nenhum arquivo é transmitido pela internet. Ao fechar a aba, os arquivos são excluídos instantaneamente.",
    faq_title: "Perguntas Frequentes",
    related_tools_title: "Ferramentas Relacionadas",
    embed_title: "Incorpore Esta Ferramenta no Seu Site",
    embed_desc: "Copie e cole este código HTML para adicionar este utilitário gratuito em seu blog ou site.",
    embed_copy_btn: "Copiar Código de Incorporação",

    hero_tag: "A Plataforma de Ferramentas Gratuitas no Navegador",
    hero_title: "Ferramentas essenciais para seu trabalho, estudos e criação",
    hero_subtitle: "Mais de 150 ferramentas gratuitas, rápidas e seguras. Processe PDFs, imagens, código e cálculos diretamente no seu navegador sem enviar arquivos.",
    hero_cta_tools: "Explorar Ferramentas",
    hero_cta_ai: "Testar Assistente IA",
    quick_jobs_title: "Tarefas Rápidas",
    categories_title: "Navegar por Categoria",
    cta_title: "Pronto para começar?",
    cta_desc: "Comece a usar qualquer ferramenta agora mesmo. Tudo roda no seu navegador: privado, rápido e gratuito.",

    job_merge_pdf: "Juntar PDFs",
    job_compress_image: "Comprimir Imagem",
    job_format_json: "Formatar JSON",
    job_generate_qr: "Gerar QR Code",
    job_count_words: "Contar Palavras",
    job_calculate_percent: "Calcular %",
    job_convert_case: "Mudar Maiúsculas",
    job_resize_image: "Redimensionar Imagem",

    cat_documents: "Documentos",
    cat_images: "Imagens",
    cat_developer: "Desenvolvedor",
    cat_calculators: "Calculadoras",
    cat_writing: "Redação",
    cat_media: "Mídia",
    cat_security: "Segurança",

    tools_page_title: "Todas as Ferramentas Online Gratuitas",
    tools_page_subtitle: "Mais de 150 utilitários cliente. Rápidos, gratuitos e seguros.",
    tools_search_placeholder: "Buscar ferramentas por nome ou palavra-chave...",
    tools_all_categories: "Todas as Categorias",
    tools_no_results: "Nenhuma ferramenta encontrada para sua busca.",

    apps_page_title: "Aplicativos Web Inteligentes e IA",
    apps_page_subtitle: "Aplicativos de última geração executados diretamente no seu navegador.",
    apps_launch: "Abrir Aplicativo",

    ai_page_title: "Suíte de Produtividade com IA",
    ai_page_subtitle: "Converse, escreva código, resolva problemas com os melhores modelos de IA.",
    ai_new_chat: "Novo Chat",
    ai_prompt_library: "Biblioteca de Prompts (160+)",
    ai_compare_models: "Comparar Modelos",
    ai_personas: "Personas e Assistentes",

    footer_tagline: "Ferramentas online gratuitas e espaço de IA para suas tarefas diárias. Privado, rápido e seguro.",
    footer_platform: "Plataforma",
    footer_ai_suite: "Suíte IA",
    footer_categories: "Categorias",
    footer_company: "Empresa",
    footer_about: "Sobre Nós",
    footer_contact: "Contato",
    footer_privacy: "Política de Privacidade",
    footer_terms: "Termos de Serviço",
    footer_rights: "Todos os direitos reservados.",
    footer_built_with: "Criado para criadores e desenvolvedores em todo o mundo.",
  },

  hi: {
    nav_tools: "टूल्स",
    nav_apps: "ऐप्स",
    nav_ai: "एआई सुइट",
    nav_hubs: "हब्स",
    nav_resources: "संसाधन",
    nav_signin: "लॉग इन",
    nav_search_placeholder: "टूल्स खोजें (उदा. पीडीएफ मर्ज करें, फोटो कंप्रेस करें)...",

    action_upload: "फ़ाइल अपलोड करें",
    action_download: "डाउनलोड करें",
    action_copy: "कॉपी करें",
    action_copied: "कॉपी हो गया!",
    action_share: "शेयर करें",
    action_embed: "एम्बेड करें",
    action_favorite: "पसंदीदा बनाएं",
    action_favorited: "सहेजा गया",
    action_all_tools: "सभी टूल्स",
    action_explore: "खोजें",

    badge_client_side: "100% ब्राउज़र में सुरक्षित",
    badge_instant: "अत्यंत तीव्र गति",
    badge_free: "हमेशा के लिए मुफ़्त",
    badge_no_upload: "सर्वर पर कोई फ़ाइल नहीं जाती",
    badge_private: "निजी एवं सुरक्षित",

    how_to_use_title: "3 आसान चरणों में उपयोग करें",
    step_1_title: "फ़ाइल चुनें या डेटा डालें",
    step_1_desc: "अपनी फ़ाइलों को सीधे ब्राउज़र में चुनें या खींचें। सारी प्रोसेसिंग आपके अपने डिवाइस पर होती है।",
    step_2_title: "सेटिंग्स चुनें और प्रोसेस करें",
    step_2_desc: "अपनी आवश्यकतानुसार विकल्प चुनें। बदलाव और गणना कुछ ही मिलीसेकंड में पूरी हो जाती है।",
    step_3_title: "परिणाम डाउनलोड या कॉपी करें",
    step_3_desc: "परिणाम देखें और बिना वॉटरमार्क के पूर्ण गोपनीयता के साथ तुरंत डाउनलोड करें।",

    features_title: "प्रमुख विशेषताएं",
    features_subtitle: "तेज़ गति, सटीक परिणाम और डेटा की पूर्ण सुरक्षा के लिए निर्मित।",
    privacy_title: "ब्राउज़र में प्रोसेसिंग क्यों आवश्यक है?",
    privacy_subtitle: "आपका डेटा कभी भी आपके डिवाइस से बाहर नहीं जाता।",
    privacy_p1: "पारंपरिक वेबसाइटों के विपरीत जो आपकी फ़ाइलों को अनजान सर्वरों पर अपलोड करती हैं, MyToolsBox सब कुछ आपके ब्राउज़र में प्रोसेस करता है।",
    privacy_p2: "इंटरनेट पर कोई डेटा नहीं भेजा जाता। टैब बंद करते ही सभी फ़ाइलें हमेशा के लिए मिट जाती हैं।",
    faq_title: "अक्सर पूछे जाने वाले प्रश्न",
    related_tools_title: "संबंधित उपयोगी टूल्स",
    embed_title: "यह टूल अपनी वेबसाइट पर लगाएं",
    embed_desc: "इस मुफ़्त टूल को अपनी वेबसाइट या ब्लॉग में जोड़ने के लिए यह कोड कॉपी करें।",
    embed_copy_btn: "एम्बेड कोड कॉपी करें",

    hero_tag: "मुफ़्त इन-ब्राउज़र टूल्स प्लेटफ़ॉर्म",
    hero_title: "दैनिक कार्यों, पढ़ाई और रचनात्मकता के लिए उपयोगी टूल्स",
    hero_subtitle: "150 से अधिक मुफ़्त, तेज़ और सुरक्षित टूल्स। पीडीएफ, फ़ोटो, कोडिंग और गणितीय कार्य बिना किसी फ़ाइल अपलोड के तुरंत पूरे करें।",
    hero_cta_tools: "सभी टूल्स देखें",
    hero_cta_ai: "एआई सहायक आज़माएं",
    quick_jobs_title: "त्वरित कार्य",
    categories_title: "श्रेणी अनुसार खोजें",
    cta_title: "क्या आप काम शुरू करने के लिए तैयार हैं?",
    cta_desc: "किसी भी टूल का तुरंत उपयोग करें। सब कुछ आपके ब्राउज़र में पूरी गोपनीयता और मुफ़्त में चलता है।",

    job_merge_pdf: "पीडीएफ जोड़ें",
    job_compress_image: "फोटो कंप्रेस करें",
    job_format_json: "जेसन फॉर्मेट करें",
    job_generate_qr: "क्यूआर कोड बनाएं",
    job_count_words: "शब्द गिनें",
    job_calculate_percent: "प्रतिशत निकालें",
    job_convert_case: "केस बदलें",
    job_resize_image: "फोटो का आकार बदलें",

    cat_documents: "दस्तावेज़",
    cat_images: "छवियां",
    cat_developer: "डेवलपर",
    cat_calculators: "कैलकुलेटर",
    cat_writing: "लेखन",
    cat_media: "मीडिया",
    cat_security: "सुरक्षा",

    tools_page_title: "सभी मुफ़्त ऑनलाइन टूल्स",
    tools_page_subtitle: "150 से अधिक इन-ब्राउज़र उपयोगिताएँ। तेज़, मुफ़्त और सुरक्षित।",
    tools_search_placeholder: "नाम या कीवर्ड से टूल खोजें...",
    tools_all_categories: "सभी श्रेणियां",
    tools_no_results: "आपकी खोज के अनुसार कोई टूल नहीं मिला।",

    apps_page_title: "स्मार्ट और इंटरैक्टिव एआई ऐप्स",
    apps_page_subtitle: "आधुनिक वेब ऐप्स जो क्लाइंट कंप्यूट और उन्नत एआई पर चलते हैं।",
    apps_launch: "ऐप खोलें",

    ai_page_title: "एआई वर्कस्पेस सुइट",
    ai_page_subtitle: "विश्व के शीर्ष एआई मॉडलों के साथ चैट करें, कोड लिखें और समस्याओं का समाधान करें।",
    ai_new_chat: "नई चैट",
    ai_prompt_library: "प्रॉम्प्ट लाइब्रेरी (160+)",
    ai_compare_models: "मॉडलों की तुलना",
    ai_personas: "सहायक और व्यक्तित्व",

    footer_tagline: "दैनिक कार्यों के लिए मुफ़्त ऑनलाइन टूल्स और एआई कार्यक्षेत्र। निजी, तेज़ और सुरक्षित।",
    footer_platform: "प्लेटफ़ॉर्म",
    footer_ai_suite: "एआई सुइट",
    footer_categories: "श्रेणियां",
    footer_company: "कंपनी",
    footer_about: "हमारे बारे में",
    footer_contact: "संपर्क",
    footer_privacy: "गोपनीयता नीति",
    footer_terms: "सेवा की शर्तें",
    footer_rights: "सर्वाधिकार सुरक्षित।",
    footer_built_with: "विश्व भर के रचनाकारों और डेवलपर्स के लिए प्रेमपूर्वक निर्मित।",
  },

  ar: {
    nav_tools: "الأدوات",
    nav_apps: "التطبيقات",
    nav_ai: "حزمة الذكاء الاصطناعي",
    nav_hubs: "المراكز",
    nav_resources: "المصادر",
    nav_signin: "تسجيل الدخول",
    nav_search_placeholder: "ابحث عن أدوات (مثلاً دمج PDF، ضغط الصور)...",

    action_upload: "رفع ملف",
    action_download: "تحميل",
    action_copy: "نسخ",
    action_copied: "تم النسخ!",
    action_share: "مشاركة",
    action_embed: "تضمين",
    action_favorite: "إضافة للمفضلة",
    action_favorited: "في المفضلة",
    action_all_tools: "جميع الأدوات",
    action_explore: "استكشاف",

    badge_client_side: "100% داخل المتصفح",
    badge_instant: "سرعة فائقة وفورية",
    badge_free: "مجاني دائماً",
    badge_no_upload: "بدون رفع للملفات على السيرفر",
    badge_private: "خصوصية وأمان تام",

    how_to_use_title: "كيفية الاستخدام في 3 خطوات بسيطة",
    step_1_title: "حدد الملف أو أدخل البيانات",
    step_1_desc: "قم بسحب ملفاتك أو اختيارها مباشرة داخل المتصفح. تجري جميع العمليات محلياً على جهازك.",
    step_2_title: "الضبط والمعالجة",
    step_2_desc: "اختر الإعدادات المناسبة. تكتمل الحسابات والتحويلات في أجزاء من الثانية.",
    step_3_title: "تحميل أو نسخ النتيجة",
    step_3_desc: "تأكد من النتيجة وحملها فوراً بدون أي علامات مائية وبخصوصية تامة.",

    features_title: "الميزات والقدرات الرئيسية",
    features_subtitle: "مصمم للسرعة الفائقة والدقة والحماية المطلقة لبياناتك.",
    privacy_title: "لماذا تعد المعالجة المحلية هي الأكثر أماناً؟",
    privacy_subtitle: "بياناتك وملفاتك لا تغادر جهازك أبداً.",
    privacy_p1: "على عكس المواقع التقليدية التي ترفع ملفاتك إلى خوادم بعيدة، يقوم MyToolsBox بمعالجة كل شيء مباشرة داخل متصفحك.",
    privacy_p2: "لا يتم نقل أي بيانات عبر الإنترنت. بمجرد إغلاق الصفحة، تُحذف جميع البيانات فوراً من الذاكرة.",
    faq_title: "الأسئلة الشائعة",
    related_tools_title: "أدوات ذات صلة قد تهمك",
    embed_title: "ضمّن هذه الأداة في موقعك",
    embed_desc: "انسخ هذا الكود لإضافة هذه الأداة التفاعلية المجانية إلى موقعك أو مدونتك.",
    embed_copy_btn: "نسخ كود التضمين",

    hero_tag: "منصة الأدوات المجانية عبر المتصفح",
    hero_title: "أدوات مفيدة لأعمالك اليومية ودراستك وإبداعك",
    hero_subtitle: "أكثر من 150 أداة مجانية وسريعة وآمنة. أنجز معاملات الـ PDF والصور والبرمجة والحسابات بدون أي رفع للملفات.",
    hero_cta_tools: "استعرض جميع الأدوات",
    hero_cta_ai: "جرب المساعد الذكي",
    quick_jobs_title: "مهام سريعة",
    categories_title: "تصفح حسب الفئة",
    cta_title: "هل أنت مستعد للبدء؟",
    cta_desc: "ابدأ باستخدام أي أداة فوراً دون الحاجة للتسجيل. سريعة، خاصة ومجانية 100%.",

    job_merge_pdf: "دمج PDF",
    job_compress_image: "ضغط الصور",
    job_format_json: "تنسيق JSON",
    job_generate_qr: "إنشاء رمز QR",
    job_count_words: "عد الكلمات",
    job_calculate_percent: "حساب النسبة",
    job_convert_case: "تغيير حالة الحروف",
    job_resize_image: "تغيير أبعاد الصورة",

    cat_documents: "المستندات",
    cat_images: "الصور",
    cat_developer: "المطورين",
    cat_calculators: "الحاسبات",
    cat_writing: "الكتابة والتحرير",
    cat_media: "الوسائط",
    cat_security: "الأمان",

    tools_page_title: "جميع الأدوات المجانية أونلاين",
    tools_page_subtitle: "اكتشف أكثر من 150 أداة داخل المتصفح. سريعة، مجانية وآمنة.",
    tools_search_placeholder: "ابحث عن أداة بالاسم أو الوصف...",
    tools_all_categories: "جميع الفئات",
    tools_no_results: "لم يتم العثور على أي أدوات مطابقة لبحثك.",

    apps_page_title: "تطبيقات ذكية وتفاعلية بالذكاء الاصطناعي",
    apps_page_subtitle: "تطبيقات الويب الحديثة التي تعمل مباشرة داخل متصفحك.",
    apps_launch: "تشغيل التطبيق",

    ai_page_title: "حزمة مساحة عمل الذكاء الاصطناعي",
    ai_page_subtitle: "تحدث، برمج، حل المسائل واكتب المحتوى مع أفضل نماذج الذكاء الاصطناعي.",
    ai_new_chat: "محادثة جديدة",
    ai_prompt_library: "مكتبة الأوامر (160+)",
    ai_compare_models: "مقارنة النماذج",
    ai_personas: "المساعدين والشخصيات",

    footer_tagline: "أدوات مجانية عبر الإنترنت وحزمة ذكاء اصطناعي لمهامك اليومية. خاصة، سريعة وآمنة.",
    footer_platform: "المنصة",
    footer_ai_suite: "حزمة الذكاء الاصطناعي",
    footer_categories: "الفئات",
    footer_company: "الشركة",
    footer_about: "من نحن",
    footer_contact: "اتصل بنا",
    footer_privacy: "سياسة الخصوصية",
    footer_terms: "شروط الخدمة",
    footer_rights: "جميع الحقوق محفوظة.",
    footer_built_with: "صُنعت بعناية للمبدعين والمطورين حول العالم.",
  },
};

// ---------------------------------------------------------------------------
// High-traffic tool localized names for top SEO capture
// ---------------------------------------------------------------------------
export const LOCALIZED_TOOL_NAMES: Record<string, Record<LocaleCode, string>> = {
  "pdf-merger": {
    en: "PDF Merger",
    es: "Unir PDF",
    ur: "پی ڈی ایف جوڑیں",
    fr: "Fusionner PDF",
    de: "PDF zusammenfügen",
    pt: "Juntar PDF",
    hi: "पीडीएफ मर्ज करें",
    ar: "دمج ملفات PDF",
  },
  "pdf-splitter": {
    en: "PDF Splitter",
    es: "Dividir PDF",
    ur: "پی ڈی ایف تقسیم کریں",
    fr: "Diviser PDF",
    de: "PDF teilen",
    pt: "Dividir PDF",
    hi: "पीडीएफ अलग करें",
    ar: "تقسيم ملفات PDF",
  },
  "pdf-compressor": {
    en: "PDF Compressor",
    es: "Comprimir PDF",
    ur: "پی ڈی ایف کمپریس کریں",
    fr: "Compresser PDF",
    de: "PDF komprimieren",
    pt: "Comprimir PDF",
    hi: "पीडीएफ कंप्रेस करें",
    ar: "ضغط ملفات PDF",
  },
  "image-compressor": {
    en: "Image Compressor",
    es: "Comprimir Imagen",
    ur: "تصویر کا سائز کم کریں",
    fr: "Compresser Image",
    de: "Bild komprimieren",
    pt: "Comprimir Imagem",
    hi: "फोटो कंप्रेस करें",
    ar: "ضغط الصور",
  },
  "image-resizer": {
    en: "Image Resizer",
    es: "Redimensionar Imagen",
    ur: "تصویر کا سائز تبدیل کریں",
    fr: "Redimensionner Image",
    de: "Bildgröße ändern",
    pt: "Redimensionar Imagem",
    hi: "फोटो का आकार बदलें",
    ar: "تغيير حجم الصور",
  },
  "json-formatter": {
    en: "JSON Formatter",
    es: "Formateador JSON",
    ur: "جے ایس او این فارمیٹر",
    fr: "Formateur JSON",
    de: "JSON Formatierer",
    pt: "Formatador JSON",
    hi: "जेसन फॉर्मेटर",
    ar: "منسق JSON",
  },
  "qr-generator": {
    en: "QR Code Generator",
    es: "Generador de Códigos QR",
    ur: "کیو آر کوڈ بنائیں",
    fr: "Générateur de QR Code",
    de: "QR-Code Generator",
    pt: "Gerador de QR Code",
    hi: "क्यूआर कोड बनाएं",
    ar: "إنشاء رموز QR",
  },
  "word-counter": {
    en: "Word Counter",
    es: "Contador de Palabras",
    ur: "الفاظ شمار کریں",
    fr: "Compteur de Mots",
    de: "Wortzähler",
    pt: "Contador de Palavras",
    hi: "शब्द गिनें",
    ar: "عداد الكلمات",
  },
  "percentage-calculator": {
    en: "Percentage Calculator",
    es: "Calculadora de Porcentajes",
    ur: "فیصد کیلکولیٹر",
    fr: "Calculateur de Pourcentage",
    de: "Prozentrechner",
    pt: "Calculadora de Porcentagem",
    hi: "प्रतिशत कैलकुलेटर",
    ar: "حاسبة النسبة المئوية",
  },
  "case-converter": {
    en: "Case Converter",
    es: "Convertidor de Mayúsculas",
    ur: "کیس کنورٹر",
    fr: "Convertisseur de Casse",
    de: "Groß-/Kleinschreibung",
    pt: "Conversor de Maiúsculas",
    hi: "केस कनवर्टर",
    ar: "تحويل حالة الحروف",
  },
  "base64-converter": {
    en: "Base64 Encoder / Decoder",
    es: "Codificador Base64",
    ur: "بیس 64 کنورٹر",
    fr: "Encodeur Base64",
    de: "Base64 Konverter",
    pt: "Codificador Base64",
    hi: "बेस64 कनवर्टर",
    ar: "تشفير Base64",
  },
  "diff-checker": {
    en: "Text Diff Checker",
    es: "Comparador de Texto",
    ur: "ٹیکسٹ موازنہ",
    fr: "Comparateur de Texte",
    de: "Textvergleich",
    pt: "Comparador de Texto",
    hi: "टेक्स्ट तुलना",
    ar: "مقارنة النصوص",
  },
  "password-generator": {
    en: "Password Generator",
    es: "Generador de Contraseñas",
    ur: "پاس ورڈ بنائیں",
    fr: "Générateur de Mots de Passe",
    de: "Passwort Generator",
    pt: "Gerador de Senhas",
    hi: "पासवर्ड जनरेटर",
    ar: "مولد كلمات المرور",
  },
  "resume-builder": {
    en: "Smart Resume Builder",
    es: "Creador de Currículum",
    ur: "سی وی بلڈر",
    fr: "Créateur de CV",
    de: "Lebenslauf Ersteller",
    pt: "Criador de Currículo",
    hi: "रिज्यूमे बिल्डर",
    ar: "منشئ السيرة الذاتية",
  },
  "math-solver": {
    en: "Step-by-Step Math Solver",
    es: "Solucionador de Matemáticas",
    ur: "ریاضی حل کنندہ",
    fr: "Solveur Mathématique",
    de: "Mathe-Löser",
    pt: "Resolvedor Matemático",
    hi: "गणित सॉल्वर",
    ar: "حل المسائل الرياضية",
  },
};
