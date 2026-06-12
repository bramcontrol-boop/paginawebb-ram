/* ============================================================================
   B-RAM · Lógica de la página
   ----------------------------------------------------------------------------
   1. Animaciones de aparición al hacer scroll (una sola vez por elemento)
   2. Logo del nav → scroll al tope absoluto
   3. Detección de scroll del navbar (sombra/borde)
   4. Tabs de servicios (cambia el panel de detalle)
   5. Theme toggle (modo claro / oscuro)
   6. Validación y envío del formulario de diagnóstico
   ========================================================================== */
(function () {
  'use strict';

  /* 1. ─────────── Animaciones de aparición al hacer scroll ──────────────── */
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    var revealEls = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
    // Escalonado: asigna un --reveal-delay incremental a cada hijo
    document.querySelectorAll('[data-reveal-stagger]').forEach(function (group) {
      var children = group.children;
      for (var i = 0; i < children.length; i++) {
        children[i].style.setProperty('--reveal-delay', (i * 120) + 'ms');
      }
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target); // se anima una sola vez
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    // Fallback: mostrar todo de inmediato
    document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach(function (el) {
      el.classList.add('is-revealed');
    });
  }

  /* 2. ─────────── Logo del nav → scroll al tope absoluto ────────────────── */
  var brandLink = document.getElementById('brand-link');
  if (brandLink) {
    brandLink.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* 3. ─────────── Detección de scroll del navbar ────────────────────────── */
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () {
      if (window.scrollY > 8) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* 4. ─────────── Tabs de servicios ─────────────────────────────────────── */
  var SERVICES = [
    {
      icon: 'ic-coin',
      title: 'Gestión de subsidios a favor del empleador',
      body: 'Identificamos, validamos y gestionamos los subsidios a los que su empresa tiene derecho — incluyendo subsidios asociados a contratación, permanencia laboral, SUE y otros incentivos contemplados por la normativa vigente. Muchas empresas los pierden por falta de gestión oportuna.',
      items: ['Subsidios no gestionados','Validación de requisitos normativos','Aplicación correcta del beneficio','Regularización administrativa']
    },
    {
      icon: 'ic-exchange',
      title: 'Recuperación de pagos previsionales en exceso',
      body: 'Revisamos la trazabilidad histórica de cotizaciones para detectar pagos duplicados, mal imputados o excesivos. Cuantificamos el monto recuperable y gestionamos la devolución directamente ante las instituciones del sistema.',
      items: ['Excesos por licencias médicas','Trabajo pesado y SIS','Rezagos AFC','Cuantificación y recuperación']
    },
    {
      icon: 'ic-file-check',
      title: 'Regularización de deudas e inconsistencias previsionales',
      body: 'Diagnosticamos el origen técnico de deudas o inconsistencias previsionales y gestionamos la normalización directa ante AFP, Isapres, AFC u otras entidades. Intervenimos en boletín laboral y previsional para proteger el cumplimiento de la empresa.',
      items: ['Boletín laboral y previsional','Regularización técnica','Apoyo administrativo','Normalización del registro']
    }
  ];

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderService(idx) {
    var s = SERVICES[idx];
    var items = s.items.map(function (it) {
      return '<div class="svc-detail-item"><span class="check"><svg><use href="#ic-check"/></svg></span><span>' + escapeHtml(it) + '</span></div>';
    }).join('');
    return ''
      + '<div class="svc-detail-inner">'
      +   '<div class="svc-detail-hd">'
      +     '<div class="svc-detail-icon"><svg><use href="#' + s.icon + '"/></svg></div>'
      +     '<div>'
      +       '<div class="tag">Servicio 0' + (idx + 1) + '</div>'
      +       '<h3>' + escapeHtml(s.title) + '</h3>'
      +     '</div>'
      +   '</div>'
      +   '<p class="svc-detail-desc">' + escapeHtml(s.body) + '</p>'
      +   '<div class="svc-detail-section">'
      +     '<div class="lbl">Alcance</div>'
      +     '<div class="svc-detail-items">' + items + '</div>'
      +   '</div>'
      + '</div>';
  }

  var detailPanel = document.getElementById('svc-detail');
  var tabs = document.querySelectorAll('#svc-tabs .svc-tab');
  function setActiveService(idx) {
    tabs.forEach(function (t, i) {
      var on = (i === idx);
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if (detailPanel) detailPanel.innerHTML = renderService(idx);
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { setActiveService(i); });
  });
  if (detailPanel) setActiveService(0);

  /* 5. ─────────── Theme toggle ──────────────────────────────────────────── */
  var themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    function updateToggleIcon(theme) {
      var use = themeToggle.querySelector('.theme-icon use');
      if (use) use.setAttribute('href', theme === 'dark' ? '#ic-moon' : '#ic-sun');
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    }
    updateToggleIcon(document.documentElement.getAttribute('data-theme') || 'dark');
    themeToggle.addEventListener('click', function () {
      var html = document.documentElement;
      var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.classList.add('theme-transitioning');
      html.setAttribute('data-theme', next);
      localStorage.setItem('bram-theme', next);
      updateToggleIcon(next);
      setTimeout(function () { html.classList.remove('theme-transitioning'); }, 400);
    });
  }

  /* 6. ─────────── Formulario de diagnóstico ─────────────────────────────── */
  var form = document.getElementById('diag-form');
  if (form) {
    var FIELDS = ['nombre', 'empresa', 'email', 'mensaje'];
    var touched = {};

    function getData() {
      var data = {};
      FIELDS.forEach(function (k) {
        var el = form.querySelector('[name="' + k + '"]');
        data[k] = el ? el.value : '';
      });
      return data;
    }
    function validate(d) {
      var e = {};
      if (!d.nombre.trim()) e.nombre = 'Requerido';
      if (!d.empresa.trim()) e.empresa = 'Requerido';
      if (!d.email.trim()) e.email = 'Requerido';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) e.email = 'Formato inválido';
      return e;
    }
    function showErrors(errs) {
      FIELDS.forEach(function (k) {
        var input = form.querySelector('[name="' + k + '"]');
        if (!input) return;
        var wrap = input.closest('.fld');
        var errEl = wrap.querySelector('.err');
        if (errs[k] && touched[k]) {
          wrap.classList.add('invalid');
          errEl.textContent = errs[k];
        } else {
          wrap.classList.remove('invalid');
          errEl.textContent = '';
        }
      });
    }
    FIELDS.forEach(function (k) {
      var input = form.querySelector('[name="' + k + '"]');
      if (!input) return;
      input.addEventListener('input', function () {
        if (touched[k]) showErrors(validate(getData()));
      });
      input.addEventListener('blur', function () {
        touched[k] = true;
        showErrors(validate(getData()));
      });
    });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var errs = validate(getData());
      FIELDS.forEach(function (k) { touched[k] = true; });
      showErrors(errs);
      if (Object.keys(errs).length) {
        var firstKey = Object.keys(errs)[0];
        var firstEl = form.querySelector('[name="' + firstKey + '"]');
        if (firstEl) firstEl.focus();
        return;
      }
      var submitBtn = form.querySelector('button[type="submit"]');
      var label = submitBtn.querySelector('.btn-label');
      var arr = submitBtn.querySelector('.arr');
      if (label) label.textContent = 'Enviando…';
      if (arr) arr.style.display = 'none';
      submitBtn.disabled = true;

      // Envío simulado. Reemplazar con un fetch() real a tu backend si se requiere.
      setTimeout(function () {
        var wrapper = document.getElementById('form-wrapper');
        wrapper.innerHTML = ''
          + '<div class="form-success">'
          +   '<div class="check"><svg><use href="#ic-check"/></svg></div>'
          +   '<div class="t">Solicitud recibida</div>'
          +   '<p>Un especialista te contactará en las próximas <strong>48 horas hábiles</strong> para coordinar la sesión inicial. Mientras tanto, te enviamos al email un resumen del proceso.</p>'
          +   '<button class="btn btn-ghost" type="button" id="form-reset">Enviar otra solicitud</button>'
          + '</div>';
        var resetBtn = document.getElementById('form-reset');
        if (resetBtn) resetBtn.addEventListener('click', function () { location.reload(); });
      }, 900);
    });
  }
})();

/* ─────────────────── Panel flotante de diagnóstico ──────────────────────── */
(function () {
  var trigger  = document.getElementById('float-trigger');
  var panel    = document.getElementById('float-panel');
  var overlay  = document.getElementById('float-overlay');
  var closeBtn = document.getElementById('float-panel-close');

  if (!trigger || !panel || !overlay) return;

  var contactVisible = false;

  function openPanel() {
    panel.classList.add('open');
    overlay.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
    trigger.classList.add('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      var first = panel.querySelector('input, textarea');
      if (first) first.focus();
    }, 380);
  }

  function closePanel() {
    panel.classList.remove('open');
    overlay.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (!contactVisible) trigger.classList.remove('hidden');
    trigger.focus();
  }

  trigger.addEventListener('click', openPanel);
  overlay.addEventListener('click', closePanel);
  if (closeBtn) closeBtn.addEventListener('click', closePanel);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
  });

  /* Ocultar trigger cuando el formulario principal es visible */
  var mainContact = document.getElementById('diagnostico');
  if (mainContact && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      contactVisible = entries[0].isIntersecting;
      if (contactVisible) trigger.classList.add('hidden');
      else if (!panel.classList.contains('open')) trigger.classList.remove('hidden');
    }, { threshold: 0.2 }).observe(mainContact);
  }

  /* Validación y envío */
  var floatForm = document.getElementById('float-form');
  if (!floatForm) return;

  var FIELDS = ['ff_nombre', 'ff_empresa', 'ff_email', 'ff_mensaje'];
  var touched = {};

  function getData() {
    var d = {};
    FIELDS.forEach(function (k) {
      var el = floatForm.querySelector('[name="' + k + '"]');
      d[k] = el ? el.value : '';
    });
    return d;
  }

  function validate(d) {
    var e = {};
    if (!d.ff_nombre.trim()) e.ff_nombre = 'Requerido';
    if (!d.ff_empresa.trim()) e.ff_empresa = 'Requerido';
    if (!d.ff_email.trim()) e.ff_email = 'Requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.ff_email.trim())) e.ff_email = 'Formato inválido';
    return e;
  }

  function showErrors(errs) {
    FIELDS.forEach(function (k) {
      var input = floatForm.querySelector('[name="' + k + '"]');
      if (!input) return;
      var wrap  = input.closest('.fld');
      var errEl = wrap && wrap.querySelector('.err');
      var hasErr = errs[k] && touched[k];
      if (wrap) wrap.classList.toggle('invalid', !!hasErr);
      if (errEl) errEl.textContent = hasErr ? errs[k] : '';
    });
  }

  FIELDS.forEach(function (k) {
    var input = floatForm.querySelector('[name="' + k + '"]');
    if (!input) return;
    input.addEventListener('input', function () { if (touched[k]) showErrors(validate(getData())); });
    input.addEventListener('blur',  function () { touched[k] = true; showErrors(validate(getData())); });
  });

  floatForm.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var errs = validate(getData());
    FIELDS.forEach(function (k) { touched[k] = true; });
    showErrors(errs);
    if (Object.keys(errs).length) {
      var firstEl = floatForm.querySelector('[name="' + Object.keys(errs)[0] + '"]');
      if (firstEl) firstEl.focus();
      return;
    }
    var btn = floatForm.querySelector('button[type="submit"]');
    var lbl = btn && btn.querySelector('.btn-label');
    var arr = btn && btn.querySelector('.arr');
    if (lbl) lbl.textContent = 'Enviando…';
    if (arr) arr.style.display = 'none';
    if (btn) btn.disabled = true;

    setTimeout(function () {
      var inner = document.getElementById('float-panel-inner');
      if (!inner) return;
      inner.innerHTML = ''
        + '<div class="form-success" style="padding:48px 8px 32px;">'
        +   '<div class="check"><svg><use href="#ic-check"/></svg></div>'
        +   '<div class="t">Solicitud recibida</div>'
        +   '<p>Un especialista te contactará en las próximas <strong>48 horas hábiles</strong>.</p>'
        +   '<button class="btn btn-ghost" type="button" id="float-success-close">Cerrar</button>'
        + '</div>';
      var sc = document.getElementById('float-success-close');
      if (sc) sc.addEventListener('click', closePanel);
    }, 900);
  });
})();
