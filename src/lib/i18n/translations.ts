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
    step_1_title: "Sube o ingresa tus datos",
    step_1_desc: "Arrastra tus archivos directamente al navegador. Todo el procesamiento se realiza localmente en tu dispositivo.",
    step_2_title: "Configura y procesa",
    step_2_desc: "Ajusta las opciones deseadas. La transformación se ejecuta en milisegundos sin demoras de servidor.",
    step_3_title: "Descarga o copia el resultado",
    step_3_desc: "Revisa tu resultado y descárgalo al instante sin marcas de agua y con total confidencialidad.",

    features_title: "Características y Funcionalidades",
    features_subtitle: "Diseñado para máxima velocidad, precisión y protección total de tus datos.",
    privacy_title: "¿Por qué la privacidad local es importante?",
    privacy_subtitle: "Tus datos nunca salen de tu dispositivo: garantizado por el aislamiento del navegador.",
    privacy_p1: "A diferencia de las herramientas en línea tradicionales que suben tus documentos a servidores remotos, MyToolsBox procesa tus archivos directamente en tu navegador usando HTML5 y WebAssembly.",
    privacy_p2: "Ningún dato viaja por internet ni se almacena en la nube. Al cerrar esta pestaña, los archivos desaparecen por completo de la memoria.",
    faq_title: "Preguntas Frecuentes",
    related_tools_title: "Herramientas Relacionadas",
    embed_title: "Incrusta esta herramienta en tu sitio web",
    embed_desc: "Copia este código HTML para agregar esta herramienta interactiva gratuita directamente en tu blog o web.",
    embed_copy_btn: "Copiar Código HTML",

    hero_tag: "Plataforma de Herramientas Gratuitas en Navegador",
    hero_title: "Herramientas útiles para tu trabajo diario y estudio",
    hero_subtitle: "Más de 150 herramientas gratuitas, rápidas y privadas. Edita documentos, imágenes, código y cálculos directamente en tu navegador sin subir archivos.",
    hero_cta_tools: "Ver Todas las Herramientas",
    hero_cta_ai: "Probar Asistente IA",
    quick_jobs_title: "Tareas Rápidas",
    categories_title: "Explorar por Categoría",
    cta_title: "¿Listo para empezar?",
    cta_desc: "Usa cualquier herramienta al instante. Todo se ejecuta en tu navegador: privado, rápido y 100% gratis.",
  },

  ur: {
    nav_tools: "ٹولز",
    nav_apps: "ایپس",
    nav_ai: "اے آئی سویٹ",
    nav_hubs: "ہبز",
    nav_resources: "وسائل",
    nav_signin: "لاگ ان کریں",
    nav_search_placeholder: "ٹولز یا مطلوبہ کام تلاش کریں (مثلاً پی ڈی ایف جوڑیں، تصویر کمپریس کریں)...",

    action_upload: "فائل اپ لوڈ کریں",
    action_download: "ڈاؤن لوڈ کریں",
    action_copy: "کاپی کریں",
    action_copied: "کاپی ہو گیا!",
    action_share: "شیئر کریں",
    action_embed: "ویب سائٹ میں لگائیں",
    action_favorite: "پسندیدہ",
    action_favorited: "محفوظ شدہ",
    action_all_tools: "تمام ٹولز",
    action_explore: "دریافت کریں",

    badge_client_side: "100% براؤزر کے اندر",
    badge_instant: "فوری رفتار",
    badge_free: "ہمیشہ کے لیے مفت",
    badge_no_upload: "سرور پر کوئی فائل نہیں جاتی",
    badge_private: "محفوظ اور پرائیویٹ",

    how_to_use_title: "3 آسان مراحل میں استعمال کا طریقہ",
    step_1_title: "1. فائل منتخب یا درج کریں",
    step_1_desc: "اپنی فائلیں براہ راست براؤزر میں ڈالیں۔ تمام پروسیسنگ آپ کے اپنے کمپیوٹر یا موبائل پر ہوتی ہے۔",
    step_2_title: "2. ترتیبات سیٹ کریں اور پروسیس کریں",
    step_2_desc: "اپنی مطلوبہ آپشنز منتخب کریں۔ نتیجہ بغیر کسی سرور کے انتظار کے فوری طور پر تیار ہو جاتا ہے۔",
    step_3_title: "3. ڈاؤن لوڈ یا کاپی کریں",
    step_3_desc: "بغیر کسی واٹر مارک اور مکمل رازداری کے ساتھ اپنی فائل فوراً ڈاؤن لوڈ یا محفوظ کریں۔",

    features_title: "اہم خصوصیات اور صلاحیتیں",
    features_subtitle: "تیز رفتاری، درستگی اور آپ کے ڈیٹا کے مکمل تحفظ کے لیے تیار کردہ۔",
    privacy_title: "براؤزر پروسیسنگ کیوں محفوظ ترین ہے؟",
    privacy_subtitle: "آپ کی فائلیں اور ڈیٹا کبھی بھی آپ کے کمپیوٹر سے باہر نہیں نکلتیں۔",
    privacy_p1: "دوسری روایتی ویب سائٹس کے برعکس جو آپ کی ذاتی فائلیں سرورز پر اپ لوڈ کرتی ہیں، MyToolsBox آپ کی فائلوں کو جدید HTML5 اور WebAssembly کے ذریعے صرف آپ کے براؤزر کے اندر پروسیس کرتا ہے۔",
    privacy_p2: "انٹرنیٹ پر کوئی ڈیٹا نہیں بھیجا جاتا۔ جیسے ہی آپ یہ ٹیب بند کرتے ہیں، آپ کا ڈیٹا مکمل طور پر ختم ہو جاتا ہے۔",
    faq_title: "عام طور پر پوچھے جانے والے سوالات",
    related_tools_title: "دیگر متعلقہ اور مفید ٹولز",
    embed_title: "اس ٹول کو اپنی ویب سائٹ میں شامل کریں",
    embed_desc: "اس کوڈ کو کاپی کر کے اپنے بلاگ یا ویب سائٹ پر لگائیں اور اپنے صارفین کو یہ مفت ٹول فراہم کریں۔",
    embed_copy_btn: "کوڈ کاپی کریں",

    hero_tag: "مفت آن لائن ٹولز اور یوٹیلیٹیز کا پلیٹ فارم",
    hero_title: "روزمرہ کے کام، پڑھائی اور کاروبار کے لیے بہترین ٹولز",
    hero_subtitle: "150 سے زائد مفت، محفوظ اور تیز ترین ٹولز۔ دستاویزات، تصاویر، کوڈ اور حسابی کام بغیر سرور پر اپ لوڈ کیے براہ راست براؤزر میں حل کریں۔",
    hero_cta_tools: "تمام ٹولز دیکھیں",
    hero_cta_ai: "اے آئی اسسٹنٹ آزمائیں",
    quick_jobs_title: "فوری کام",
    categories_title: "کیٹیگریز کے لحاظ سے تلاش کریں",
    cta_title: "کیا آپ کام شروع کرنے کے لیے تیار ہیں؟",
    cta_desc: "کوئی بھی ٹول بغیر کسی رجسٹریشن کے فوراً استعمال کریں۔ تیز، مفت اور 100% محفوظ۔",
  },

  fr: {
    nav_tools: "Outils",
    nav_apps: "Applications",
    nav_ai: "Suite IA",
    nav_hubs: "Pôles",
    nav_resources: "Ressources",
    nav_signin: "Connexion",
    nav_search_placeholder: "Rechercher un outil (ex: fusionner pdf, compresser image)...",

    action_upload: "Téléverser",
    action_download: "Télécharger",
    action_copy: "Copier",
    action_copied: "Copié !",
    action_share: "Partager",
    action_embed: "Intégrer",
    action_favorite: "Favori",
    action_favorited: "Enregistré",
    action_all_tools: "Tous les outils",
    action_explore: "Explorer",

    badge_client_side: "100% Côté Client",
    badge_instant: "Vitesse Instantanée",
    badge_free: "Gratuit Pour Toujours",
    badge_no_upload: "Zéro Envoi Sur Serveur",
    badge_private: "Privé & Sécurisé",

    how_to_use_title: "Comment utiliser en 3 étapes simples",
    step_1_title: "Téléversez ou saisissez vos données",
    step_1_desc: "Déposez vos fichiers directement dans votre navigateur. Tout le traitement est local.",
    step_2_title: "Configurez et traitez",
    step_2_desc: "Ajustez vos préférences. La transformation s'exécute en millisecondes.",
    step_3_title: "Téléchargez le résultat",
    step_3_desc: "Exportez ou téléchargez instantanément sans filigrane et avec une confidentialité totale.",

    features_title: "Fonctionnalités Principales",
    features_subtitle: "Conçu pour la rapidité, la précision et la protection absolue de vos données.",
    privacy_title: "Pourquoi la confidentialité locale est primordiale",
    privacy_subtitle: "Vos données ne quittent jamais votre appareil grâce à l'isolation du navigateur.",
    privacy_p1: "Contrairement aux convertisseurs classiques qui envoient vos fichiers sur le cloud, MyToolsBox traite vos données directement dans votre navigateur.",
    privacy_p2: "Aucune donnée n'est stockée sur nos serveurs. Fermez l'onglet et tout disparaît définitivement.",
    faq_title: "Questions Fréquemment Posées",
    related_tools_title: "Outils Connexes",
    embed_title: "Intégrer cet outil sur votre site",
    embed_desc: "Copiez ce code HTML pour intégrer cet outil directement sur votre site ou blog.",
    embed_copy_btn: "Copier le code",

    hero_tag: "La Plateforme d'Outils Gratuits en Ligne",
    hero_title: "Des outils utiles pour votre travail quotidien et vos études",
    hero_subtitle: "Plus de 150 outils gratuits, rapides et privés. Traitez vos documents, images et codes directement dans votre navigateur sans téléversement.",
    hero_cta_tools: "Voir tous les outils",
    hero_cta_ai: "Essayer l'assistant IA",
    quick_jobs_title: "Tâches Rapides",
    categories_title: "Parcourir par Catégorie",
    cta_title: "Prêt à commencer ?",
    cta_desc: "Utilisez n'importe quel outil immédiatement. Tout s'exécute dans votre navigateur : privé, rapide et 100% gratuit.",
  },

  de: {
    nav_tools: "Werkzeuge",
    nav_apps: "Apps",
    nav_ai: "KI-Suite",
    nav_hubs: "Bereiche",
    nav_resources: "Ressourcen",
    nav_signin: "Anmelden",
    nav_search_placeholder: "Werkzeug suchen (z. B. PDF zusammenfügen, Bild komprimieren)...",

    action_upload: "Datei hochladen",
    action_download: "Herunterladen",
    action_copy: "Kopieren",
    action_copied: "Kopiert!",
    action_share: "Teilen",
    action_embed: "Einbetten",
    action_favorite: "Favorit",
    action_favorited: "Gespeichert",
    action_all_tools: "Alle Werkzeuge",
    action_explore: "Entdecken",

    badge_client_side: "100% Im Browser",
    badge_instant: "Sofortige Geschwindigkeit",
    badge_free: "Dauerhaft Kostenlos",
    badge_no_upload: "Kein Server-Upload",
    badge_private: "Privat & Sicher",

    how_to_use_title: "In 3 einfachen Schritten verwenden",
    step_1_title: "Daten hochladen oder eingeben",
    step_1_desc: "Ziehen Sie Ihre Dateien direkt in den Browser. Die gesamte Verarbeitung erfolgt lokal auf Ihrem Gerät.",
    step_2_title: "Konfigurieren & Verarbeiten",
    step_2_desc: "Passen Sie Einstellungen an. Die Ausführung erfolgt in Millisekunden.",
    step_3_title: "Ergebnis herunterladen",
    step_3_desc: "Laden Sie Ihr Ergebnis ohne Wasserzeichen und bei voller Datensicherheit herunter.",

    features_title: "Wichtigste Funktionen",
    features_subtitle: "Entwickelt für maximale Geschwindigkeit und absoluten Datenschutz.",
    privacy_title: "Warum Datenschutz im Browser wichtig ist",
    privacy_subtitle: "Ihre Daten verlassen niemals Ihr Gerät – garantiert durch moderne Web-Technologien.",
    privacy_p1: "Im Gegensatz zu herkömmlichen Diensten verarbeitet MyToolsBox alle Dateien lokal in Ihrem Browser mit HTML5 und WebAssembly.",
    privacy_p2: "Keine Daten werden über das Internet gesendet oder gespeichert. Schließen Sie den Tab und alle Daten sind weg.",
    faq_title: "Häufig gestellte Fragen",
    related_tools_title: "Ähnliche Werkzeuge",
    embed_title: "Dieses Werkzeug einbetten",
    embed_desc: "Kopieren Sie diesen HTML-Code, um das Tool direkt auf Ihrer Website einzubinden.",
    embed_copy_btn: "Code kopieren",

    hero_tag: "Die kostenlose Online-Werkzeugplattform",
    hero_title: "Nützliche Werkzeuge für Arbeit, Studium und Alltag",
    hero_subtitle: "Über 150 kostenlose, schnelle und sichere Tools. Bearbeiten Sie Dokumente, Bilder und Code direkt im Browser ohne Server-Uploads.",
    hero_cta_tools: "Alle Werkzeuge ansehen",
    hero_cta_ai: "KI-Assistent testen",
    quick_jobs_title: "Schnellaufgaben",
    categories_title: "Nach Kategorie durchsuchen",
    cta_title: "Bereit loszulegen?",
    cta_desc: "Starten Sie sofort ohne Registrierung. Alles läuft im Browser: privat, schnell und 100% kostenlos.",
  },

  pt: {
    nav_tools: "Ferramentas",
    nav_apps: "Aplicativos",
    nav_ai: "Suíte IA",
    nav_hubs: "Centros",
    nav_resources: "Recursos",
    nav_signin: "Entrar",
    nav_search_placeholder: "Buscar ferramentas (ex: juntar pdf, comprimir imagem)...",

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
    badge_no_upload: "Sem Envio ao Servidor",
    badge_private: "Privado e Seguro",

    how_to_use_title: "Como usar em 3 passos fáceis",
    step_1_title: "Envie ou insira os dados",
    step_1_desc: "Arraste os arquivos diretamente no navegador. Todo o processamento é executado localmente.",
    step_2_title: "Configure e processe",
    step_2_desc: "Ajuste as preferências desejadas. A transformação acontece em milissegundos.",
    step_3_title: "Baixe ou copie o resultado",
    step_3_desc: "Baixe o arquivo final sem marcas d'água e com sigilo total.",

    features_title: "Recursos e Funcionalidades",
    features_subtitle: "Desenvolvido para alta velocidade, precisão e privacidade total.",
    privacy_title: "Por que a privacidade local importa",
    privacy_subtitle: "Seus dados nunca saem do seu computador ou celular.",
    privacy_p1: "Ao contrário dos conversores tradicionais que enviam seus arquivos para servidores desconhecidos, MyToolsBox processa tudo diretamente no seu navegador.",
    privacy_p2: "Nenhum dado é transmitido pela internet. Ao fechar esta aba, seus arquivos desaparecem completamente.",
    faq_title: "Perguntas Frequentes",
    related_tools_title: "Ferramentas Relacionadas",
    embed_title: "Incorpore esta ferramenta em seu site",
    embed_desc: "Copie este trecho HTML para adicionar este utilitário gratuito ao seu site ou blog.",
    embed_copy_btn: "Copiar Código",

    hero_tag: "Plataforma de Ferramentas Gratuitas Online",
    hero_title: "Ferramentas úteis para o seu dia a dia e trabalho",
    hero_subtitle: "Mais de 150 ferramentas gratuitas, rápidas e seguras. Trabalhe com PDFs, imagens e códigos sem enviar arquivos para a nuvem.",
    hero_cta_tools: "Ver Todas as Ferramentas",
    hero_cta_ai: "Testar IA Assistente",
    quick_jobs_title: "Tarefas Rápidas",
    categories_title: "Navegar por Categoria",
    cta_title: "Pronto para começar?",
    cta_desc: "Comece a usar agora mesmo sem cadastro. Rápido, privado e 100% grátis.",
  },

  hi: {
    nav_tools: "टूल्स",
    nav_apps: "ऐप्स",
    nav_ai: "एआई सुइट",
    nav_hubs: "हब्स",
    nav_resources: "संसाधन",
    nav_signin: "साइन इन",
    nav_search_placeholder: "टूल्स खोजें (जैसे: पीडीएफ मर्ज करें, फोटो कंप्रेस करें)...",

    action_upload: "फाइल अपलोड करें",
    action_download: "डाउनलोड करें",
    action_copy: "कॉपी करें",
    action_copied: "कॉपी हो गया!",
    action_share: "शेयर करें",
    action_embed: "वेबसाइट में लगाएं",
    action_favorite: "पसंदीदा",
    action_favorited: "सेव किया गया",
    action_all_tools: "सभी टूल्स",
    action_explore: "देखें",

    badge_client_side: "100% ब्राउज़र में",
    badge_instant: "अत्यंत तीव्र गति",
    badge_free: "हमेशा के लिए मुफ्त",
    badge_no_upload: "सर्वर पर कोई डेटा नहीं जाता",
    badge_private: "सुरक्षित एवं निजी",

    how_to_use_title: "3 आसान चरणों में उपयोग कैसे करें",
    step_1_title: "फाइल चुनें या डेटा दर्ज करें",
    step_1_desc: "अपनी फाइलें सीधे ब्राउज़र में डालें। सभी काम आपके डिवाइस पर ही संपन्न होते हैं।",
    step_2_title: "सेटिंग्स चुनें और प्रोसेस करें",
    step_2_desc: "अपनी पसंद के अनुसार विकल्प चुनें। कुछ ही मिलीसेकंड में परिणाम तैयार हो जाता है।",
    step_3_title: "डाउनलोड या कॉपी करें",
    step_3_desc: "बिना किसी वॉटरमार्क और पूर्ण सुरक्षा के साथ परिणाम तुरंत डाउनलोड करें।",

    features_title: "प्रमुख विशेषताएं",
    features_subtitle: "तेज़ गति, शुद्धता और आपके डेटा की गोपनीयता के लिए निर्मित।",
    privacy_title: "ब्राउज़र में काम करना क्यों सुरक्षित है?",
    privacy_subtitle: "आपकी फाइलें कभी भी आपके फोन या कंप्यूटर से बाहर नहीं जाती हैं।",
    privacy_p1: "पारंपरिक टूल्स के विपरीत जो आपकी फाइलें सर्वर पर अपलोड करते हैं, MyToolsBox आपकी फाइलों को सीधे आपके ब्राउज़र में सुरक्षित रखता है।",
    privacy_p2: "इंटरनेट पर कोई डेटा नहीं भेजा जाता। टैब बंद करते ही सब कुछ स्वतः समाप्त हो जाता है।",
    faq_title: "अक्सर पूछे जाने वाले सवाल",
    related_tools_title: "संबंधित टूल्स",
    embed_title: "अपनी वेबसाइट पर लगाएं",
    embed_desc: "इस कोड को कॉपी करके अपनी वेबसाइट या ब्लॉग में मुफ्त में जोड़ें।",
    embed_copy_btn: "कोड कॉपी करें",

    hero_tag: "मुफ्त ऑनलाइन टूल्स और सुविधाएं",
    hero_title: "दैनिक कार्यों, पढ़ाई और व्यवसाय के लिए सर्वश्रेष्ठ टूल्स",
    hero_subtitle: "150 से अधिक मुफ्त, तेज़ और सुरक्षित टूल्स। पीडीएफ, तस्वीरें, कोड और गणितीय गणनाएं बिना अपलोड किए तुरंत हल करें।",
    hero_cta_tools: "सभी टूल्स देखें",
    hero_cta_ai: "एआई सहायक आज़माएं",
    quick_jobs_title: "शीघ्र कार्य",
    categories_title: "श्रेणी अनुसार खोजें",
    cta_title: "क्या आप तैयार हैं?",
    cta_desc: "बिना किसी रजिस्ट्रेशन के तुरंत उपयोग करें। सुरक्षित, तेज़ और 100% मुफ्त।",
  },

  ar: {
    nav_tools: "الأدوات",
    nav_apps: "التطبيقات",
    nav_ai: "جناح الذكاء الاصطناعي",
    nav_hubs: "المراكز",
    nav_resources: "المصادر",
    nav_signin: "تسجيل الدخول",
    nav_search_placeholder: "ابحث عن أداة (مثل دمج pdf، ضغط الصور)...",

    action_upload: "رفع ملف",
    action_download: "تحميل",
    action_copy: "نسخ",
    action_copied: "تم النسخ!",
    action_share: "مشاركة",
    action_embed: "تضمين",
    action_favorite: "المفضلة",
    action_favorited: "تم الحفظ",
    action_all_tools: "جميع الأدوات",
    action_explore: "استكشف",

    badge_client_side: "100% داخل المتصفح",
    badge_instant: "سرعة فورية",
    badge_free: "مجاني دائماً",
    badge_no_upload: "بدون رفع للسيرفر",
    badge_private: "خاص وآمن تماماً",

    how_to_use_title: "كيفية الاستخدام في 3 خطوات سهلة",
    step_1_title: "1. اختر أو اسحب ملفاتك",
    step_1_desc: "ضع ملفاتك مباشرة في المتصفح. جميع المعالجات تتم محلياً على جهازك.",
    step_2_title: "2. اضبط الإعدادات والمعالجة",
    step_2_desc: "خصص الخيارات حسب رغبتك. تتم المعالجة في أجزاء من الثانية دون انتظار.",
    step_3_title: "3. قم بالتحميل أو النسخ",
    step_3_desc: "احصل على نتيجتك فوراً وبدون علامات مائية وبخصوصية تامة.",

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
    ur: "پی ڈی ایف کا سائز کم کریں",
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
};
