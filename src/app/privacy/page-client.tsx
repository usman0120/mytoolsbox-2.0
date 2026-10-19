"use client";

import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import { Shield, ServerOff, Database, Mail } from "lucide-react";
import { PageShell, ToolHeader } from "@/components/common/workload-layouts";
import type { LocaleCode } from "@/lib/i18n/config";

const PRIVACY_COPY: Record<LocaleCode, { overview: string; processing: string; limits: string }> = {
  en: { overview: "Data handling depends on the feature you use.", processing: "Browser-based operations process content on your device. Server and AI features send submitted data to their services. Review the tool's processing information before submitting sensitive content.", limits: "Sign-in, connectivity, and offline availability depend on the tool. Account synchronization and server or AI requests require a connection." },
  es: { overview: "El tratamiento de los datos depende de la función utilizada.", processing: "Las operaciones del navegador procesan el contenido en tu dispositivo. Las funciones de servidor e IA envían los datos a sus servicios. Revisa la información de procesamiento antes de enviar contenido sensible.", limits: "El inicio de sesión, la conexión y la disponibilidad sin conexión dependen de la herramienta. La sincronización y las solicitudes de servidor o IA requieren conexión." },
  fr: { overview: "Le traitement des données dépend de la fonctionnalité utilisée.", processing: "Les opérations du navigateur traitent le contenu sur votre appareil. Les fonctions serveur et IA transmettent les données à leurs services. Consultez les informations de traitement avant de soumettre du contenu sensible.", limits: "La connexion au compte et la disponibilité hors ligne dépendent de l'outil. La synchronisation et les requêtes serveur ou IA nécessitent une connexion réseau." },
  de: { overview: "Die Datenverarbeitung hängt von der verwendeten Funktion ab.", processing: "Browserbasierte Vorgänge verarbeiten Inhalte auf Ihrem Gerät. Server- und KI-Funktionen senden eingereichte Daten an ihre Dienste. Prüfen Sie die Verarbeitungshinweise, bevor Sie sensible Inhalte übermitteln.", limits: "Anmeldung und Offline-Verfügbarkeit hängen vom Werkzeug ab. Kontosynchronisierung sowie Server- und KI-Anfragen benötigen eine Internetverbindung." },
  pt: { overview: "O tratamento dos dados depende do recurso utilizado.", processing: "As operações do navegador processam conteúdo no seu dispositivo. Os recursos de servidor e IA enviam dados aos seus serviços. Consulte as informações de processamento antes de enviar conteúdo sensível.", limits: "Login e disponibilidade offline dependem da ferramenta. A sincronização e as solicitações de servidor ou IA exigem conexão." },
  hi: { overview: "डेटा का उपयोग आपके चुने हुए फ़ीचर पर निर्भर करता है।", processing: "ब्राउज़र आधारित कार्य आपके डिवाइस पर सामग्री प्रोसेस करते हैं। सर्वर और AI फ़ीचर भेजे गए डेटा को अपनी सेवाओं तक पहुँचाते हैं। संवेदनशील सामग्री भेजने से पहले टूल की प्रोसेसिंग जानकारी पढ़ें।", limits: "साइन-इन और ऑफलाइन उपलब्धता टूल पर निर्भर करती है। खाता सिंक और सर्वर या AI अनुरोधों के लिए इंटरनेट आवश्यक है।" },
  ur: { overview: "ڈیٹا کا استعمال منتخب فیچر پر منحصر ہے۔", processing: "براؤزر پر مبنی کام آپ کے آلے پر مواد پروسیس کرتے ہیں۔ سرور اور AI فیچر جمع کردہ ڈیٹا اپنی خدمات کو بھیجتے ہیں۔ حساس مواد بھیجنے سے پہلے ٹول کی پروسیسنگ معلومات پڑھیں۔", limits: "سائن ان اور آف لائن دستیابی ٹول پر منحصر ہے۔ اکاؤنٹ سنک اور سرور یا AI درخواستوں کے لیے انٹرنیٹ ضروری ہے۔" },
  ar: { overview: "تعتمد معالجة البيانات على الميزة المستخدمة.", processing: "تعالج عمليات المتصفح المحتوى على جهازك. ترسل ميزات الخادم والذكاء الاصطناعي البيانات المقدمة إلى خدماتها. راجع معلومات المعالجة قبل إرسال محتوى حساس.", limits: "يعتمد تسجيل الدخول والتوفر دون اتصال على الأداة. تتطلب مزامنة الحساب وطلبات الخادم أو الذكاء الاصطناعي اتصالاً بالإنترنت." },
};

export function PrivacyPageClient() {
  const { t, localizePath, locale } = useI18n();
  const copy = PRIVACY_COPY[locale];

  return (
    <PageShell className="max-w-3xl">
      {/* Header */}
      <ToolHeader title={t("privacy_page_title", "Privacy Policy")} description={copy.overview} />

      <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-8">
        {/* Last updated */}
        <p className="text-sm text-muted-foreground animate-fade-in-up">
          {t("legal_last_updated", "Last updated: September 2026")}
        </p>

        {/* 1. Core Commitment */}
        <section className="animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            1. {t("about_privacy_title", "Privacy First Architecture")}
          </h2>
          <p>
            {SITE_CONFIG.name}: {copy.processing}
          </p>
        </section>

        {/* 2. Client Side Guarantee */}
        <section className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <ServerOff className="h-5 w-5 text-emerald-500" />
            2. {t("nav_tools", "Tools")}
          </h2>
          <p>
            {copy.limits}
          </p>
        </section>

        {/* 3. Account Data */}
        <section className="animate-fade-in-up" style={{ animationDelay: "180ms" }}>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-500" />
            3. {t("settings_tab_account", "Account Data & Authentication")}
          </h2>
          <p>
            {t("account_guest_notice", "Create an account or sign in to save favorites, track history, and sync your settings across devices.")}
          </p>
          <p>
            {t("settings_subtitle", "Manage your profile, preferences, and account security.")}
          </p>
        </section>

        {/* 4. Contact */}
        <section className="animate-fade-in-up border-t pt-8" style={{ animationDelay: "240ms" }}>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            4. {t("contact_title", "Contact Us")}
          </h2>
          <p>
            {t("contact_subtitle", "Have questions or need assistance? Reach out directly.")}
          </p>
          <p className="mt-2">
            <Link href={localizePath("/contact")} className="text-primary hover:underline font-medium">
              {t("contact_title", "Contact Support")} &rarr;
            </Link>
          </p>
        </section>
      </div>
    </PageShell>
  );
}
