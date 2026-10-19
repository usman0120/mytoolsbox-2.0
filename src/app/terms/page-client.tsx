"use client";

import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import { CheckCircle2, Shield, Scale, Mail } from "lucide-react";
import { PageShell, ToolHeader } from "@/components/common/workload-layouts";
import type { LocaleCode } from "@/lib/i18n/config";

const SERVICE_COPY: Record<LocaleCode, { description: string; limits: string; ownership: string }> = {
  en: { description: "Browser utilities, apps, resources, and AI features are available through this service.", limits: "Pricing, credits, sign-in requirements, processing mode, and offline availability depend on the feature. Review the feature and account details before use.", ownership: "Your content remains yours. Files, text, and data you submit belong to you. Processing and transmission depend on the feature; see the Privacy Policy before submitting sensitive content." },
  es: { description: "Este servicio ofrece utilidades de navegador, aplicaciones, recursos y funciones de IA.", limits: "Los precios, créditos, requisitos de acceso, procesamiento y disponibilidad sin conexión dependen de la función. Revisa sus detalles y los de tu cuenta antes de usarla.", ownership: "Tu contenido sigue siendo tuyo. Los archivos, textos y datos enviados te pertenecen. La transmisión depende de la función; consulta la Política de privacidad antes de enviar contenido sensible." },
  fr: { description: "Ce service propose des utilitaires de navigateur, des applications, des ressources et des fonctions IA.", limits: "Les tarifs, crédits, conditions de connexion, traitements et accès hors ligne dépendent de la fonctionnalité. Consultez ses détails et ceux du compte avant utilisation.", ownership: "Votre contenu reste le vôtre. Les fichiers, textes et données soumis vous appartiennent. Leur transmission dépend de la fonctionnalité ; consultez la politique de confidentialité avant de soumettre du contenu sensible." },
  de: { description: "Dieser Dienst bietet Browserwerkzeuge, Apps, Ressourcen und KI-Funktionen.", limits: "Preise, Credits, Anmeldepflicht, Verarbeitung und Offline-Verfügbarkeit hängen von der Funktion ab. Prüfen Sie die Funktions- und Kontodetails vor der Nutzung.", ownership: "Ihre Inhalte bleiben Ihre Inhalte. Eingereichte Dateien, Texte und Daten gehören Ihnen. Die Übertragung hängt von der Funktion ab; lesen Sie vor sensiblen Eingaben die Datenschutzerklärung." },
  pt: { description: "Este serviço oferece utilitários de navegador, aplicativos, recursos e funções de IA.", limits: "Preços, créditos, requisitos de login, processamento e disponibilidade offline dependem do recurso. Consulte os detalhes do recurso e da conta antes de usar.", ownership: "Seu conteúdo continua sendo seu. Os arquivos, textos e dados enviados pertencem a você. A transmissão depende do recurso; consulte a Política de Privacidade antes de enviar conteúdo sensível." },
  hi: { description: "यह सेवा ब्राउज़र टूल, ऐप, संसाधन और AI फ़ीचर प्रदान करती है।", limits: "कीमत, क्रेडिट, साइन-इन, प्रोसेसिंग और ऑफलाइन उपलब्धता फ़ीचर पर निर्भर करती है। उपयोग से पहले फ़ीचर और खाते की जानकारी पढ़ें।", ownership: "आपकी सामग्री आपकी है। भेजी गई फ़ाइलें, टेक्स्ट और डेटा आपके हैं। डेटा भेजना फ़ीचर पर निर्भर करता है; संवेदनशील सामग्री भेजने से पहले गोपनीयता नीति पढ़ें।" },
  ur: { description: "یہ خدمت براؤزر ٹول، ایپس، وسائل اور AI فیچر فراہم کرتی ہے۔", limits: "قیمت، کریڈٹ، سائن ان، پروسیسنگ اور آف لائن دستیابی فیچر پر منحصر ہے۔ استعمال سے پہلے فیچر اور اکاؤنٹ کی معلومات پڑھیں۔", ownership: "آپ کا مواد آپ کا ہے۔ جمع کردہ فائلیں، متن اور ڈیٹا آپ کی ملکیت ہیں۔ ڈیٹا بھیجنا فیچر پر منحصر ہے؛ حساس مواد بھیجنے سے پہلے رازداری کی پالیسی پڑھیں۔" },
  ar: { description: "توفر هذه الخدمة أدوات المتصفح والتطبيقات والموارد وميزات الذكاء الاصطناعي.", limits: "تعتمد الأسعار والأرصدة وتسجيل الدخول والمعالجة والتوفر دون اتصال على الميزة. راجع تفاصيل الميزة والحساب قبل الاستخدام.", ownership: "يبقى محتواك ملكاً لك. الملفات والنصوص والبيانات المقدمة تخصك. يعتمد نقل البيانات على الميزة؛ راجع سياسة الخصوصية قبل إرسال محتوى حساس." },
};

export function TermsPageClient() {
  const { t, localizePath, locale } = useI18n();
  const copy = SERVICE_COPY[locale];

  return (
    <PageShell className="max-w-3xl">
      {/* Header */}
      <ToolHeader title={t("terms_page_title", "Terms of Service")} description={t("terms_page_subtitle", "Terms for using MyToolsBox.")} />

      <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-8">
        <p className="text-sm text-muted-foreground animate-fade-in-up">
          {t("legal_last_updated", "Last updated: September 2026")}
        </p>

        {/* 1. Acceptance */}
        <section className="animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using {SITE_CONFIG.name}, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.
          </p>
        </section>

        {/* 2. Description of Service */}
        <section className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            2. Description of Service
          </h2>
          <p>
            {copy.description}
          </p>
          <p>{copy.limits}</p>
        </section>

        {/* 3. Your Content */}
        <section className="animate-fade-in-up" style={{ animationDelay: "180ms" }}>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Scale className="h-5 w-5 text-amber-500" />
            3. Intellectual Property & Your Content
          </h2>
          <p>
            {copy.ownership}
          </p>
          <Link href={localizePath("/privacy")} className="text-primary hover:underline">{t("privacy_page_title", "Privacy Policy")}</Link>
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
