import JSZip from 'jszip';

export async function generateShopifyThemeZip(): Promise<Blob> {
  const zip = new JSZip();

  // 1. layout/theme.liquid
  zip.file(
    'layout/theme.liquid',
    `<!doctype html>
<html class="no-js" lang="{{ request.locale.iso_code }}">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="#16a34a">
    <link rel="canonical" href="{{ canonical_url }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet">
    
    <title>
      {{ page_title }}
      {%- if current_tags %} &ndash; tagged "{{ current_tags | join: ', ' }}"{% endif -%}
      {%- if current_page != 1 %} &ndash; Page {{ current_page }}{% endif -%}
      {%- unless page_title contains shop.name %} &ndash; {{ shop.name }}{% endunless -%}
    </title>

    {% if page_description %}
      <meta name="description" content="{{ page_description | escape }}">
    {% endif %}

    {{ content_for_header }}

    {{ 'theme.css' | asset_url | stylesheet_tag }}
  </head>

  <body class="bg-gray-50 text-gray-900 font-sans antialiased selection:bg-red-500 selection:text-white">
    {% section 'announcement-bar' %}
    {% section 'header' %}

    <main id="MainContent" class="focus-none" role="main" tabindex="-1">
      {{ content_for_layout }}
    </main>

    {% section 'trust-badges' %}
    {% section 'footer' %}

    {% render 'whatsapp-floating' %}

    {{ 'theme.js' | asset_url | script_tag }}
  </body>
</html>`
  );

  // 2. config/settings_schema.json
  zip.file(
    'config/settings_schema.json',
    JSON.stringify(
      [
        {
          name: 'theme_info',
          theme_name: 'DIAYMA GAAW Sénégal',
          theme_version: '1.0.0',
          theme_author: 'DIAYMA GAAW Studio',
          theme_documentation_url: 'https://diaymagaaw.sn',
          theme_support_url: 'https://wa.me/221778452020'
        },
        {
          name: 'Identité et Couleurs Sénégal',
          settings: [
            {
              type: 'color',
              id: 'color_primary',
              label: 'Couleur Principale (Boutons Action / Rouge)',
              default: '#DC2626'
            },
            {
              type: 'color',
              id: 'color_secondary',
              label: 'Couleur Secondaire (Vert Confiance)',
              default: '#16A34A'
            },
            {
              type: 'color',
              id: 'color_accent',
              label: 'Couleur Accent (Jaune / Or)',
              default: '#EAB308'
            },
            {
              type: 'text',
              id: 'whatsapp_number',
              label: 'Numéro WhatsApp (avec indicatif +221)',
              default: '+221778452020'
            },
            {
              type: 'text',
              id: 'currency_label',
              label: 'Symbole Devise',
              default: 'FCFA'
            }
          ]
        },
        {
          name: 'Paiements Mobiles (Wave & Orange Money)',
          settings: [
            {
              type: 'checkbox',
              id: 'enable_wave',
              label: 'Activer le badge Wave Sénégal',
              default: true
            },
            {
              type: 'checkbox',
              id: 'enable_orange_money',
              label: 'Activer le badge Orange Money',
              default: true
            },
            {
              type: 'checkbox',
              id: 'enable_cod',
              label: 'Activer Paiement à la Livraison (Cash on Delivery)',
              default: true
            }
          ]
        }
      ],
      null,
      2
    )
  );

  // 3. config/settings_data.json
  zip.file(
    'config/settings_data.json',
    JSON.stringify(
      {
        current: {
          color_primary: '#DC2626',
          color_secondary: '#16A34A',
          color_accent: '#EAB308',
          whatsapp_number: '+221778452020',
          enable_wave: true,
          enable_orange_money: true,
          enable_cod: true
        }
      },
      null,
      2
    )
  );

  // 4. sections/announcement-bar.liquid
  zip.file(
    'sections/announcement-bar.liquid',
    `{% if section.settings.show_announcement %}
<div class="bg-gray-950 text-white text-xs sm:text-sm py-2 px-4 border-b border-gray-800">
  <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
    <div class="flex items-center gap-4 text-center sm:text-left mx-auto sm:mx-0 font-medium">
      <span>🚚 {{ section.settings.text_delivery | default: 'Livraison rapide à Dakar & Banlieue' }}</span>
      <span class="hidden md:inline text-gray-500">|</span>
      <span class="hidden md:inline">💳 {{ section.settings.text_payment | default: 'Paiement à la livraison' }}</span>
      <span class="hidden md:inline text-gray-500">|</span>
      <span class="hidden md:inline">📱 {{ section.settings.text_mobile | default: 'Wave & Orange Money disponibles' }}</span>
    </div>
    <div class="hidden lg:flex items-center gap-3 text-xs text-gray-300">
      <a href="https://wa.me/{{ settings.whatsapp_number | remove: '+' }}" class="hover:text-green-400 flex items-center gap-1 font-semibold">
        <span>Support WhatsApp : {{ settings.whatsapp_number }}</span>
      </a>
    </div>
  </div>
</div>
{% endif %}

{% schema %}
{
  "name": "Barre d'annonce",
  "settings": [
    {
      "type": "checkbox",
      "id": "show_announcement",
      "label": "Afficher la barre d'annonce",
      "default": true
    },
    {
      "type": "text",
      "id": "text_delivery",
      "label": "Texte Livraison",
      "default": "Livraison rapide à Dakar & banlieue"
    },
    {
      "type": "text",
      "id": "text_payment",
      "label": "Texte Paiement",
      "default": "Paiement à la livraison"
    },
    {
      "type": "text",
      "id": "text_mobile",
      "label": "Texte Mobile Money",
      "default": "Wave & Orange Money"
    }
  ]
}
{% endschema %}`
  );

  // 5. sections/header.liquid
  zip.file(
    'sections/header.liquid',
    `<header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-20 gap-4">
      
      <!-- Logo -->
      <div class="flex items-center gap-3">
        <a href="/" class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center text-white font-black text-xl shadow-md">
            DG
          </div>
          <div>
            <span class="text-2xl font-extrabold tracking-tight text-gray-900 font-display">
              DIAYMA <span class="text-red-600">GAAW</span>
            </span>
            <span class="block text-[10px] uppercase font-bold tracking-widest text-emerald-600 -mt-1">
              Sénégal Express
            </span>
          </div>
        </a>
      </div>

      <!-- Search Bar -->
      <div class="hidden md:flex flex-1 max-w-xl mx-4">
        <form action="{{ routes.search_url }}" method="get" class="relative w-full">
          <input
            type="search"
            name="q"
            placeholder="Que recherchez-vous ? (Téléphones, mixeur, TV...)"
            class="w-full pl-11 pr-24 py-2.5 rounded-full border-2 border-gray-200 focus:border-red-600 focus:outline-none text-sm transition bg-gray-50 focus:bg-white"
          >
          <button type="submit" class="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full transition shadow-sm">
            Rechercher
          </button>
        </form>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3 sm:gap-4">
        <a href="{{ routes.account_url }}" class="flex items-center gap-1.5 text-gray-700 hover:text-red-600 text-sm font-semibold p-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          <span class="hidden sm:inline">Mon Compte</span>
        </a>

        <a href="{{ routes.cart_url }}" class="relative flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3.5 py-2 rounded-full font-bold text-sm transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          <span class="hidden sm:inline">Panier</span>
          <span class="w-5 h-5 bg-red-600 text-white text-xs flex items-center justify-center rounded-full font-black">
            {{ cart.item_count }}
          </span>
        </a>
      </div>

    </div>

    <!-- Navigation Menu Desktop -->
    <nav class="hidden lg:flex items-center justify-between border-t border-gray-100 py-3 text-sm font-medium text-gray-700">
      <div class="flex items-center gap-6">
        <a href="/" class="text-red-600 font-bold hover:text-red-700">Accueil</a>
        <a href="/collections/all" class="hover:text-red-600 transition">Toute la Boutique</a>
        <a href="/collections/telephones-accessoires" class="hover:text-red-600 transition">Électronique</a>
        <a href="/collections/electromenager" class="hover:text-red-600 transition">Électroménager</a>
        <a href="/collections/sante-bien-etre" class="hover:text-red-600 transition">Santé & Bien-être</a>
        <a href="/collections/promotions" class="text-red-600 font-bold hover:text-red-700 flex items-center gap-1">
          🔥 Promotions Flash
        </a>
        <a href="/pages/contact" class="hover:text-red-600 transition">Contact</a>
      </div>
      <div class="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
        <span>🇸🇳 Partout au Sénégal</span>
      </div>
    </nav>
  </div>
</header>`
  );

  // 6. sections/hero-banner.liquid
  zip.file(
    'sections/hero-banner.liquid',
    `<section class="relative bg-gradient-to-br from-gray-900 via-gray-950 to-emerald-950 text-white overflow-hidden py-12 lg:py-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      
      <div class="lg:col-span-7 space-y-6 text-center lg:text-left">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
          <span>⚡ LIVRAISON RAPIDE À DAKAR EN 2H À 4H</span>
        </div>
        
        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight font-display">
          {{ section.settings.title | default: 'Les bons produits au bon prix' }}
        </h1>
        
        <p class="text-gray-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0">
          {{ section.settings.subtitle | default: 'Découvrez nos produits tendance et profitez de nos meilleures offres au Sénégal avec paiement par Wave, Orange Money ou à la livraison.' }}
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
          <a href="{{ section.settings.btn1_link | default: '/collections/all' }}" class="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-base rounded-xl transition shadow-lg shadow-red-600/30 text-center">
            {{ section.settings.btn1_text | default: 'ACHETER MAINTENANT' }}
          </a>
          <a href="{{ section.settings.btn2_link | default: '/collections/promotions' }}" class="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-base rounded-xl backdrop-blur-sm border border-white/20 transition text-center">
            {{ section.settings.btn2_text | default: 'VOIR LES PROMOTIONS' }}
          </a>
        </div>

        <!-- Badges garanties -->
        <div class="grid grid-cols-3 gap-2 pt-6 border-t border-gray-800/80 text-xs text-gray-300">
          <div class="flex items-center gap-2">
            <span class="text-emerald-400 font-bold">✓</span>
            <span>Garantie 100% Neuf</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-emerald-400 font-bold">✓</span>
            <span>Paiement à la réception</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-emerald-400 font-bold">✓</span>
            <span>Support WhatsApp 7j/7</span>
          </div>
        </div>
      </div>

      <div class="lg:col-span-5 relative">
        <div class="relative mx-auto max-w-md rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
          <img
            src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop"
            alt="Produits tendance DIAYMA GAAW Sénégal"
            class="w-full h-80 sm:h-96 object-cover"
          >
          <div class="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-xl text-gray-900 flex items-center justify-between shadow-lg">
            <div>
              <span class="text-xs font-extrabold text-red-600 uppercase">Offre du jour</span>
              <h3 class="font-bold text-sm">Smartphones & Électroménager</h3>
            </div>
            <span class="px-3 py-1 bg-red-600 text-white text-xs font-extrabold rounded-lg">Jusqu'à -40%</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

{% schema %}
{
  "name": "Bannière Principale",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Titre Principal",
      "default": "Les bons produits au bon prix"
    },
    {
      "type": "textarea",
      "id": "subtitle",
      "label": "Sous-titre",
      "default": "Découvrez nos produits tendance et profitez de nos meilleures offres au Sénégal."
    },
    {
      "type": "text",
      "id": "btn1_text",
      "label": "Texte Bouton 1",
      "default": "ACHETER MAINTENANT"
    },
    {
      "type": "url",
      "id": "btn1_link",
      "label": "Lien Bouton 1"
    },
    {
      "type": "text",
      "id": "btn2_text",
      "label": "Texte Bouton 2",
      "default": "VOIR LES PROMOTIONS"
    },
    {
      "type": "url",
      "id": "btn2_link",
      "label": "Lien Bouton 2"
    }
  ],
  "presets": [
    {
      "name": "Bannière Principale DIAYMA GAAW"
    }
  ]
}
{% endschema %}`
  );

  // 7. sections/trust-badges.liquid
  zip.file(
    'sections/trust-badges.liquid',
    `<section class="bg-white py-12 border-y border-gray-200">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      
      <div class="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
        <div class="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0 font-bold text-2xl">
          🚚
        </div>
        <div>
          <h4 class="font-bold text-gray-900 text-sm">Livraison Rapide</h4>
          <p class="text-xs text-gray-600 mt-0.5">À Dakar et partout au Sénégal en 24/48h.</p>
        </div>
      </div>

      <div class="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
        <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-2xl">
          💳
        </div>
        <div>
          <h4 class="font-bold text-gray-900 text-sm">Paiement Sécurisé</h4>
          <p class="text-xs text-gray-600 mt-0.5">Wave, Orange Money & Paiement à la livraison.</p>
        </div>
      </div>

      <div class="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
        <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-2xl">
          🔒
        </div>
        <div>
          <h4 class="font-bold text-gray-900 text-sm">Achat 100% Sécurisé</h4>
          <p class="text-xs text-gray-600 mt-0.5">Vos informations personnelles sont protégées.</p>
        </div>
      </div>

      <div class="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
        <div class="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 font-bold text-2xl">
          ✅
        </div>
        <div>
          <h4 class="font-bold text-gray-900 text-sm">Produits Vérifiés</h4>
          <p class="text-xs text-gray-600 mt-0.5">Sélection rigoureuse et garantie satisfaction.</p>
        </div>
      </div>

    </div>
  </div>
</section>

{% schema %}
{
  "name": "Confiance et Garanties",
  "settings": [],
  "presets": [
    {
      "name": "Confiance et Garanties"
    }
  ]
}
{% endschema %}`
  );

  // 8. snippets/whatsapp-floating.liquid
  zip.file(
    'snippets/whatsapp-floating.liquid',
    `<div class="fixed bottom-6 right-6 z-50">
  <a
    href="https://wa.me/{{ settings.whatsapp_number | remove: '+' }}?text={{ 'Bonjour DIAYMA GAAW, je souhaite avoir des informations sur vos produits.' | url_encode }}"
    target="_blank"
    rel="noopener noreferrer"
    class="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-3.5 rounded-full shadow-2xl transition hover:scale-105"
    aria-label="Commander sur WhatsApp"
  >
    <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
    <span class="hidden sm:inline text-sm">Commander sur WhatsApp</span>
  </a>
</div>`
  );

  // 9. sections/footer.liquid
  zip.file(
    'sections/footer.liquid',
    `<footer class="bg-gray-950 text-gray-300 pt-16 pb-12 border-t border-gray-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-gray-800">
      
      <div class="lg:col-span-2 space-y-4">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white font-black">
            DG
          </div>
          <span class="text-2xl font-black text-white tracking-tight">DIAYMA <span class="text-red-500">GAAW</span></span>
        </div>
        <p class="text-sm text-gray-400 max-w-sm">
          « Achetez simplement, recevez rapidement » — Votre boutique e-commerce de référence au Sénégal. Produits neufs garantis avec paiement Wave, Orange Money et livraison rapide à Dakar et régions.
        </p>
        <div class="space-y-1 text-sm text-gray-300">
          <p>📍 Dakar, Sénégal</p>
          <p>📞 Téléphone : +221 77 845 20 20</p>
          <p>✉️ Email : contact@diaymagaaw.sn</p>
        </div>
      </div>

      <div>
        <h4 class="text-white font-bold text-sm mb-4 uppercase tracking-wider">Boutique</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="/collections/telephones-accessoires" class="hover:text-white transition">Téléphones & Accessoires</a></li>
          <li><a href="/collections/electromenager" class="hover:text-white transition">Électroménager</a></li>
          <li><a href="/collections/informatique" class="hover:text-white transition">Informatique</a></li>
          <li><a href="/collections/sante-bien-etre" class="hover:text-white transition">Santé & Bien-être</a></li>
          <li><a href="/collections/promotions" class="hover:text-red-400 font-bold transition">🔥 Grandes Promotions</a></li>
        </ul>
      </div>

      <div>
        <h4 class="text-white font-bold text-sm mb-4 uppercase tracking-wider">Service Client</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="/pages/livraison" class="hover:text-white transition">Tarifs & Délais de Livraison</a></li>
          <li><a href="/pages/retours" class="hover:text-white transition">Conditions de Retour & Garantie</a></li>
          <li><a href="/pages/faq" class="hover:text-white transition">Foire Aux Questions (FAQ)</a></li>
          <li><a href="/pages/contact" class="hover:text-white transition">Nous contacter</a></li>
          <li><a href="/account" class="hover:text-white transition">Suivre ma commande</a></li>
        </ul>
      </div>

      <div>
        <h4 class="text-white font-bold text-sm mb-4 uppercase tracking-wider">Modes de Paiement</h4>
        <p class="text-xs text-gray-400 mb-3">Payez facilement par mobile money au Sénégal :</p>
        <div class="flex flex-wrap gap-2 text-xs font-bold">
          <span class="px-2.5 py-1.5 bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg">Wave</span>
          <span class="px-2.5 py-1.5 bg-orange-600/30 text-orange-300 border border-orange-500/30 rounded-lg">Orange Money</span>
          <span class="px-2.5 py-1.5 bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg">Cash à la livraison</span>
        </div>
      </div>

    </div>

    <div class="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
      <p>&copy; {{ 'now' | date: "%Y" }} DIAYMA GAAW Sénégal. Tous droits réservés.</p>
      <div class="flex gap-4">
        <a href="/pages/mentions-legales" class="hover:underline">Mentions légales</a>
        <a href="/pages/politique-confidentialite" class="hover:underline">Confidentialité</a>
        <a href="/pages/cgv" class="hover:underline">CGV</a>
      </div>
    </div>
  </div>
</footer>`
  );

  // 10. templates/index.json
  zip.file(
    'templates/index.json',
    JSON.stringify(
      {
        sections: {
          banner: {
            type: 'hero-banner'
          },
          trust: {
            type: 'trust-badges'
          }
        },
        order: ['banner', 'trust']
      },
      null,
      2
    )
  );

  // 11. locales/fr.json
  zip.file(
    'locales/fr.json',
    JSON.stringify(
      {
        general: {
          search: 'Rechercher un produit',
          cart: 'Panier',
          checkout: 'Commander',
          continue_shopping: 'Continuer les achats'
        },
        products: {
          product: {
            add_to_cart: 'Ajouter au panier',
            buy_now: 'Acheter maintenant',
            whatsapp_order: 'Commander sur WhatsApp',
            out_of_stock: 'Rupture de stock',
            in_stock: 'En stock au Sénégal'
          }
        }
      },
      null,
      2
    )
  );

  // 12. assets/theme.css
  zip.file(
    'assets/theme.css',
    `/* DIAYMA GAAW Official Shopify Theme Stylesheet */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary-red: #dc2626;
  --secondary-green: #16a34a;
  --accent-yellow: #eab308;
}

body {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
}

.font-display {
  font-family: 'Outfit', system-ui, -apple-system, sans-serif;
}
`
  );

  // 13. assets/theme.js
  zip.file(
    'assets/theme.js',
    `// DIAYMA GAAW Shopify JavaScript Bundle
console.log('DIAYMA GAAW Theme initialized for Senegal');
`
  );

  // 14. README.md with full installation instructions
  zip.file(
    'README.md',
    `# DIAYMA GAAW - Thème Shopify E-commerce Sénégal (OS 2.0)

Thème Shopify ultra moderne, prêt à l'emploi et optimisé pour le marché sénégalais (Dakar et régions).

## Instructions d'installation dans Shopify :

1. Connectez-vous à votre interface d'administration **Shopify** (ex: *votre-boutique.myshopify.com/admin*).
2. Rendez-vous dans le menu **Boutique en ligne** > **Thèmes**.
3. Dans la section *Bibliothèque de thèmes*, cliquez sur **Ajouter un thème** > **Téléverser le fichier zip**.
4. Sélectionnez ce fichier zip (\`diayma-gaaw-shopify-theme.zip\`).
5. Cliquez sur **Téléverser**.
6. Une fois le téléversement terminé, cliquez sur **Actions** > **Publier** (ou **Personnaliser** pour ajuster vos bannières, produits et numéros WhatsApp).

## Fonctionnalités incluses :
- Adapté à la devise FCFA
- Intégration Wave Sénégal & Orange Money
- Option de paiement à la livraison (Cash on delivery)
- Bouton de commande directe sur WhatsApp
- Barre d'urgence et compte à rebours de promotion
- 100% Responsive Mobile First
`
  );

  return await zip.generateAsync({ type: 'blob' });
}
