import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

export type Lang = 'fr' | 'ar';

type Dict = Record<string, string>;

const fr: Dict = {
  // Brand
  brand_name: 'Académie',
  brand_highlight: 'Lumen',

  // Navbar
  nav_register: "S'inscrire",
  nav_admin: 'Administration',

  // Landing — Hero
  hero_badge: 'Les inscriptions sont ouvertes pour la promotion 2026',
  hero_title_1: 'Développez les compétences qui font',
  hero_title_2: 'avancer votre carrière',
  hero_subtitle:
    "Lumen Academy est un centre de formation moderne proposant des cours pratiques en ingénierie et technologie. Réservez votre place en moins d'une minute — aucun compte requis.",
  hero_cta_register: "S'inscrire à un cours",
  hero_cta_admin: 'Tableau de bord',
  stat_courses: 'Cours actifs',
  stat_students: 'Étudiants formés',
  stat_completion: 'Taux de réussite',

  // Landing — Courses
  courses_title: 'Découvrez nos cours',
  courses_subtitle:
    `Dispensés par des professionnels de l'industrie avec des projets concrets.`,
  courses_enroll_now: "S'inscrire maintenant",
  courses_enroll: "S'inscrire",

  // Landing — Features
  feature_instructors_title: 'Instructeurs experts',
  feature_instructors_body:
    'Apprenez auprès de professionnels activement en exercice, pas seulement des théoriciens.',
  feature_schedule_title: 'Horaire flexible',
  feature_schedule_body:
    'Sessions en soirée et le week-end, conçues pour les professionnels et les étudiants.',
  feature_certificate_title: 'Certificat reconnu',
  feature_certificate_body:
    `Obtenez un certificat de completion valorisé par les employeurs de l'industrie.`,

  // Landing — CTA
  cta_title: 'Votre place est à un formulaire près',
  cta_body:
    "Inscrivez-vous maintenant et notre équipe confirmera votre inscription sous 24 heures. Le paiement peut être réglé plus tard.",
  cta_button: "Commencer l'inscription",

  // Registration page
  reg_back_home: "Retour à l'accueil",
  reg_success_title: 'Inscription reçue !',
  reg_success_body:
    'Merci, {name}. Votre place pour {course} est réservée. Le statut de paiement est {status} — notre équipe vous contactera bientôt.',
  reg_summary_name: 'Nom',
  reg_summary_phone: 'Téléphone',
  reg_summary_course: 'Cours',
  reg_summary_payment: 'Paiement',
  reg_payment_pending: 'En attente',
  reg_register_another: 'Inscrire un autre étudiant',
  reg_title: 'Inscription étudiant',
  reg_subtitle:
    `Remplissez vos informations pour réserver une place. Cela prend moins d'une minute.`,
  reg_field_name: 'Nom complet',
  reg_field_name_error: 'Saisissez au moins 2 caractères',
  reg_field_name_placeholder: 'ex. Jean Dupont',
  reg_field_phone: 'Numéro de téléphone',
  reg_field_phone_error: 'Saisissez un numéro de téléphone valide',
  reg_field_phone_placeholder: '+33 6 12 34 56 78',
  reg_field_course: 'Choisir un cours',
  reg_field_course_loading: 'Chargement des cours…',
  reg_field_course_placeholder: 'Choisissez un cours',
  reg_payment_notice:
    'Le paiement est collecté ultérieurement. Votre inscription commence avec un statut de paiement {status}.',
  reg_submit: `Soumettre l'inscription`,
  reg_submitting: 'Envoi…',
  reg_error_fields: 'Veuillez remplir tous les champs correctement.',
  reg_error_generic: 'Une erreur est survenue. Veuillez réessayer.',

  // Admin — Login
  admin_login_title: 'Accès administrateur',
  admin_login_subtitle:
    'Saisissez votre mot de passe pour gérer les inscriptions des étudiants.',
  admin_login_password: 'Mot de passe',
  admin_login_placeholder: 'Saisir le mot de passe admin',
  admin_login_button: 'Déverrouiller le tableau de bord',
  admin_login_verifying: 'Vérification…',
  admin_login_error: 'Mot de passe incorrect. Veuillez réessayer.',
  admin_login_demo: 'Mot de passe démo :',

  // Admin — Dashboard
  admin_dashboard_title: 'Tableau de bord',
  admin_dashboard_subtitle:
    'Gérez les inscriptions et les paiements des étudiants.',
  admin_refresh: 'Rafraîchir',
  admin_signout: 'Déconnexion',
  admin_stat_total: 'Total étudiants',
  admin_stat_revenue: 'Revenu total',
  admin_stat_paid: 'Payés',
  admin_stat_pending: 'En attente',
  admin_search_placeholder: 'Rechercher par nom…',
  admin_filter_all_statuses: 'Tous les statuts',
  admin_filter_paid: 'Payé',
  admin_filter_pending: 'En attente',
  admin_filter_all_courses: 'Tous les cours',
  admin_export_csv: 'Exporter CSV',
  admin_showing: 'Affichage de',
  admin_of: 'sur',
  admin_students: 'étudiants',
  admin_clear_filters: 'Effacer les filtres',
  admin_no_students: 'Aucun étudiant trouvé',
  admin_no_students_hint: `Essayez d'ajuster votre recherche ou vos filtres.`,
  admin_table_name: 'Nom',
  admin_table_phone: 'Téléphone',
  admin_table_course: 'Cours',
  admin_table_registered: 'Inscrit le',
  admin_table_payment: 'Paiement',
  admin_table_action: 'Action',
  admin_mark_pending: 'Marquer en attente',
  admin_mark_paid: 'Marquer payé',
  admin_payment_paid: 'Payé',
  admin_toast_refreshed: 'Données rafraîchies',
  admin_toast_marked: 'Marqué {name} comme {status}',
  admin_toast_update_error: 'Impossible de mettre à jour le statut de paiement.',
  admin_toast_export_empty: 'Aucun étudiant à exporter avec les filtres actuels.',
  admin_toast_exported: '{count} étudiants exportés en CSV',

  // 404
  notfound_title: "La page que vous recherchez n'existe pas.",
  notfound_go_home: "Retour à l'accueil",

  // Language switcher
  lang_fr: 'FR',
  lang_ar: 'AR',
};

const ar: Dict = {
  // Brand
  brand_name: 'الأكاديمية',
  brand_highlight: 'لومن',

  // Navbar
  nav_register: 'تسجيل',
  nav_admin: 'الإدارة',

  // Landing — Hero
  hero_badge: 'التسجيل مفتوح لدفعة 2026',
  hero_title_1: 'طور المهارات التي',
  hero_title_2: 'تدفع مسيرتك المهنية إلى الأمام',
  hero_subtitle:
    'أكاديمية لومن مركز تدريب حديث يقدم دورات عملية في الهندسة والتقنية. احجز مقعدك في أقل من دقيقة — دون الحاجة إلى حساب.',
  hero_cta_register: 'سجل في دورة',
  hero_cta_admin: 'لوحة التحكم',
  stat_courses: 'دورات نشطة',
  stat_students: 'طلاب تم تدريبهم',
  stat_completion: 'نسبة الإتمام',

  // Landing — Courses
  courses_title: 'اكتشف دوراتنا',
  courses_subtitle: 'تقدمها مهنيون من صناعة العملاء مع مشاريع واقعية.',
  courses_enroll_now: 'سجل الآن',
  courses_enroll: 'سجل',

  // Landing — Features
  feature_instructors_title: 'مدربون خبراء',
  feature_instructors_body: 'تعلم من محترفين يعملون فعلياً في المجال، وليس منظّرين فقط.',
  feature_schedule_title: 'جدول مرن',
  feature_schedule_body: 'حصص مسائية ونهاية الأسبوع مصممة للمهنيين والطلاب العاملين.',
  feature_certificate_title: 'شهادة معتمدة',
  feature_certificate_body: 'احصل على شهادة إتمام يقدّرها أصحاب العمل في الصناعة.',

  // Landing — CTA
  cta_title: 'مقعدك على بُعد نموذج واحد',
  cta_body: 'سجل الآن وفريقنا سيؤكد تسجيلك خلال 24 ساعة. يمكن دفع الرسوم لاحقاً.',
  cta_button: 'ابدأ التسجيل',

  // Registration page
  reg_back_home: 'العودة إلى الرئيسية',
  reg_success_title: 'تم استلام التسجيل!',
  reg_success_body: 'شكراً {name}. تم حجز مقعدك في {course}. حالة الدفع {status} — سيتواصل معك فريقنا قريباً.',
  reg_summary_name: 'الاسم',
  reg_summary_phone: 'الهاتف',
  reg_summary_course: 'الدورة',
  reg_summary_payment: 'الدفع',
  reg_payment_pending: 'قيد الانتظار',
  reg_register_another: 'تسجيل طالب آخر',
  reg_title: 'تسجيل الطالب',
  reg_subtitle: 'املأ بياناتك لحجز مقعد. يستغرق أقل من دقيقة.',
  reg_field_name: 'الاسم الكامل',
  reg_field_name_error: 'أدخل حرفين على الأقل',
  reg_field_name_placeholder: 'مثال: أحمد بن علي',
  reg_field_phone: 'رقم الهاتف',
  reg_field_phone_error: 'أدخل رقم هاتف صحيح',
  reg_field_phone_placeholder: '+33 6 12 34 56 78',
  reg_field_course: 'اختر دورة',
  reg_field_course_loading: 'تحميل الدورات…',
  reg_field_course_placeholder: 'اختر دورة',
  reg_payment_notice: 'يتم تحصيل الدفع لاحقاً. يبدأ تسجيلك بحالة دفع {status}.',
  reg_submit: 'إرسال التسجيل',
  reg_submitting: 'جارٍ الإرسال…',
  reg_error_fields: 'يرجى ملء جميع الحقول بشكل صحيح.',
  reg_error_generic: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',

  // Admin — Login
  admin_login_title: 'دخول المسؤول',
  admin_login_subtitle: 'أدخل كلمة المرور لإدارة تسجيلات الطلاب.',
  admin_login_password: 'كلمة المرور',
  admin_login_placeholder: 'أدخل كلمة مرور المسؤول',
  admin_login_button: 'فتح لوحة التحكم',
  admin_login_verifying: 'جارٍ التحقق…',
  admin_login_error: 'كلمة مرور غير صحيحة. يرجى المحاولة مرة أخرى.',
  admin_login_demo: 'كلمة مرور تجريبية:',

  // Admin — Dashboard
  admin_dashboard_title: 'لوحة التحكم',
  admin_dashboard_subtitle: 'إدارة تسجيلات الطلاب والمدفوعات.',
  admin_refresh: 'تحديث',
  admin_signout: 'تسجيل الخروج',
  admin_stat_total: 'إجمالي الطلاب',
  admin_stat_revenue: 'إجمالي الإيرادات',
  admin_stat_paid: 'مدفوع',
  admin_stat_pending: 'قيد الانتظار',
  admin_search_placeholder: 'بحث بالاسم…',
  admin_filter_all_statuses: 'كل الحالات',
  admin_filter_paid: 'مدفوع',
  admin_filter_pending: 'قيد الانتظار',
  admin_filter_all_courses: 'كل الدورات',
  admin_export_csv: 'تصدير CSV',
  admin_showing: 'عرض',
  admin_of: 'من',
  admin_students: 'طالب',
  admin_clear_filters: 'مسح الفلاتر',
  admin_no_students: 'لم يتم العثور على طلاب',
  admin_no_students_hint: 'حاول تعديل البحث أو الفلاتر.',
  admin_table_name: 'الاسم',
  admin_table_phone: 'الهاتف',
  admin_table_course: 'الدورة',
  admin_table_registered: 'تاريخ التسجيل',
  admin_table_payment: 'الدفع',
  admin_table_action: 'إجراء',
  admin_mark_pending: 'وضع قيد الانتظار',
  admin_mark_paid: 'وضع مدفوع',
  admin_payment_paid: 'مدفوع',
  admin_toast_refreshed: 'تم تحديث البيانات',
  admin_toast_marked: 'تم وضع علامة {name} كـ {status}',
  admin_toast_update_error: 'تعذّر تحديث حالة الدفع.',
  admin_toast_export_empty: 'لا يوجد طلاب للتصدير بالفلاتر الحالية.',
  admin_toast_exported: 'تم تصدير {count} طالب إلى CSV',

  // 404
  notfound_title: 'الصفحة التي تبحث عنها غير موجودة.',
  notfound_go_home: 'العودة إلى الرئيسية',

  // Language switcher
  lang_fr: 'FR',
  lang_ar: 'AR',
};

const dicts: Record<Lang, Dict> = { fr, ar };

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: string, params?: Record<string, string>) => string;
  dir: 'ltr' | 'rtl';
};

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'lumen_lang';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    return saved === 'ar' || saved === 'fr' ? saved : 'fr';
  });

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next = prev === 'fr' ? 'ar' : 'fr';
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      let str = dicts[lang][key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
        }
      }
      return str;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, toggleLang, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
