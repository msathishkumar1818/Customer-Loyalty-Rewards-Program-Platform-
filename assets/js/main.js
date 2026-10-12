/**
 * PERKPULSE - GLOBAL CONTROLLER
 * Handles: Branded loader, Dark Mode (#000000), RTL/LTR, Click-only Dropdowns,
 * Mobile Drawer & Accordion, Active Nav, Scroll-to-Top.
 */

(function () {
  'use strict';

  // 1. Initial State Hydration (Run immediately to prevent FOUC)
  const savedTheme = localStorage.getItem('perkpulse_theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }

  const savedDir = localStorage.getItem('perkpulse_dir') || 'ltr';
  document.documentElement.setAttribute('dir', savedDir);

  document.addEventListener('DOMContentLoaded', () => {
    if (savedTheme === 'dark' && document.body) {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else if (document.body) {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    }
    initLoader();
    initThemeToggle();
    initRtlToggle();
    initDesktopDropdown();
    initMobileNav();
    initScrollToTop();
    initHeaderScroll();
    highlightActiveNav();
    initPricingCalculator();
    initBillingToggle();
    initFaqAccordion();
    initDashboardTabs();
  });

  // 2. Branded Loader
  function initLoader() {
    const loader = document.getElementById('global-loader');
    if (!loader) return;

    const hideLoader = () => {
      loader.classList.add('loaded');
      setTimeout(() => {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 400);
    };

    if (document.readyState === 'complete') {
      setTimeout(hideLoader, 250);
    } else {
      window.addEventListener('load', () => setTimeout(hideLoader, 250));
    }
  }

  // 3. Dark Mode Toggle
  function initThemeToggle() {
    const toggles = document.querySelectorAll('.js-theme-toggle');
    if (!toggles.length) return;

    const updateToggleUI = (isDark) => {
      toggles.forEach((btn) => {
        btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        btn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
        const label = btn.querySelector('.theme-label-text');
        if (label) {
          label.textContent = isDark ? 'Light Mode' : 'Dark Mode';
        }
      });
    };

    updateToggleUI(document.documentElement.classList.contains('dark'));

    toggles.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const isCurrentlyDark = document.documentElement.classList.contains('dark');
        const newTheme = isCurrentlyDark ? 'light' : 'dark';

        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
          if (document.body) {
            document.body.classList.add('dark');
            document.body.classList.remove('light');
          }
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
          if (document.body) {
            document.body.classList.remove('dark');
            document.body.classList.add('light');
          }
        }

        localStorage.setItem('perkpulse_theme', newTheme);
        updateToggleUI(newTheme === 'dark');
      });
    });
  }

  // 4. RTL / LTR Toggle
  function initRtlToggle() {
    const toggles = document.querySelectorAll('.js-rtl-toggle');
    if (!toggles.length) return;

    const updateRtlUI = (dir) => {
      toggles.forEach((btn) => {
        const textSpan = btn.querySelector('.rtl-label-text');
        if (textSpan) {
          textSpan.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
        }
        btn.setAttribute('aria-label', dir === 'rtl' ? 'Switch to Left to Right' : 'Switch to Right to Left');
      });
    };

    updateRtlUI(document.documentElement.getAttribute('dir') || 'ltr');

    toggles.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
        const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';

        document.documentElement.setAttribute('dir', newDir);
        localStorage.setItem('perkpulse_dir', newDir);
        updateRtlUI(newDir);
      });
    });
  }

  // 5. Desktop Home Dropdown (CLICK ONLY, NEVER HOVER)
  function initDesktopDropdown() {
    const trigger = document.getElementById('homeDropdownBtn');
    const menu = document.getElementById('homeDropdownMenu');
    if (!trigger || !menu) return;

    const closeDropdown = () => {
      menu.classList.remove('show');
      trigger.setAttribute('aria-expanded', 'false');
    };

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.classList.contains('show');
      if (isOpen) {
        closeDropdown();
      } else {
        menu.classList.add('show');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!trigger.contains(e.target) && !menu.contains(e.target)) {
        closeDropdown();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('show')) {
        closeDropdown();
        trigger.focus();
      }
    });
  }

  // 6. Mobile Navigation Drawer & Accordion (Strict Click-Only Toggle & Auto-Close)
  function initMobileNav() {
    const openBtn = document.getElementById('mobileMenuOpenBtn');
    const closeBtn = document.getElementById('mobileMenuCloseBtn');
    const drawer = document.getElementById('mobileNavDrawer');
    const backdrop = document.getElementById('mobileNavBackdrop');
    const homeAccordionBtn = document.getElementById('mobileHomeAccordionBtn');
    const homeAccordionContent = document.getElementById('mobileHomeAccordion');

    if (!drawer) return;

    // Reset Home accordion to closed state
    const resetHomeAccordion = () => {
      if (homeAccordionContent) {
        homeAccordionContent.classList.remove('show');
      }
      if (homeAccordionBtn) {
        homeAccordionBtn.setAttribute('aria-expanded', 'false');
        const arrow = homeAccordionBtn.querySelector('.mobile-nav-arrow');
        if (arrow) arrow.classList.remove('rotate-90');
      }
    };

    const openDrawer = () => {
      drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
      // Always ensure Home dropdown starts closed when drawer opens
      resetHomeAccordion();
    };

    const closeDrawer = () => {
      drawer.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
      document.body.style.overflow = '';
      if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
      // Automatically close Home dropdown on drawer close
      resetHomeAccordion();
    };

    if (openBtn) openBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    // Close drawer on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });

    // Automatically close mobile nav drawer when window is resized to desktop (> 1380px)
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1380 && drawer.classList.contains('open')) {
        closeDrawer();
      }
    }, { passive: true });

    // Mobile Home accordion (Click only to toggle, otherwise closed)
    if (homeAccordionBtn && homeAccordionContent) {
      homeAccordionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = homeAccordionContent.classList.contains('show');
        if (isOpen) {
          resetHomeAccordion();
        } else {
          homeAccordionContent.classList.add('show');
          homeAccordionBtn.setAttribute('aria-expanded', 'true');
          const arrow = homeAccordionBtn.querySelector('.mobile-nav-arrow');
          if (arrow) arrow.classList.add('rotate-90');
        }
      });
    }

    // Auto-close accordion if clicking anywhere else inside the mobile menu
    drawer.addEventListener('click', (e) => {
      if (homeAccordionBtn && homeAccordionContent) {
        if (!homeAccordionBtn.contains(e.target) && !homeAccordionContent.contains(e.target)) {
          resetHomeAccordion();
        }
      }
    });

    // ALL navigation clicks inside mobile menu must close drawer immediately
    const navLinks = drawer.querySelectorAll('a');
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        closeDrawer();
      });
    });
  }

  // 7. Scroll To Top Button
  function initScrollToTop() {
    const btn = document.getElementById('scroll-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 350) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 8. Header scroll shadow
  function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // 9. Active Nav Highlighter
  function highlightActiveNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const allLinks = document.querySelectorAll('.desktop-nav .nav-link, .mobile-nav-link, .dropdown-link, .mobile-sub-link');

    allLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;
      const targetPage = href.split('/').pop().split('#')[0];

      if (targetPage && currentPath.toLowerCase() === targetPage.toLowerCase()) {
        link.classList.add('active');
        if (link.classList.contains('dropdown-link')) {
          const homeTrigger = document.getElementById('homeDropdownBtn');
          if (homeTrigger) homeTrigger.classList.add('active');
        }
      }
    });
  }

  // 10. Pricing Register Volume Calculator
  function initPricingCalculator() {
    const slider = document.getElementById('storeRangeSlider');
    const storeCountVal = document.getElementById('storeCountVal');
    const calcPriceVal = document.getElementById('calcPriceVal');
    const calcTpsVal = document.getElementById('calcTpsVal');

    if (!slider || !storeCountVal) return;

    const updateCalc = () => {
      const stores = parseInt(slider.value, 10);
      storeCountVal.textContent = stores + (stores >= 500 ? '+' : '');

      let monthlyCost;
      if (stores <= 10) {
        monthlyCost = 249;
      } else if (stores <= 25) {
        monthlyCost = 499;
      } else if (stores <= 50) {
        monthlyCost = 799;
      } else if (stores <= 100) {
        monthlyCost = 1299;
      } else {
        monthlyCost = 1299 + (stores - 100) * 11;
      }

      if (calcPriceVal) {
        calcPriceVal.textContent = '$' + monthlyCost.toLocaleString();
      }

      if (calcTpsVal) {
        calcTpsVal.textContent = (stores * 85).toLocaleString() + ' TPS';
      }
    };

    slider.addEventListener('input', updateCalc);
    updateCalc();
  }

  // 11. Billing Cycle Toggle (Monthly vs Annual -20%)
  function initBillingToggle() {
    const toggle = document.getElementById('billingCycleToggle');
    const growthPrice = document.getElementById('priceGrowthVal');
    const enterprisePrice = document.getElementById('priceEnterpriseVal');
    const periodLabels = document.querySelectorAll('.billing-period-text');

    if (!toggle) return;

    toggle.addEventListener('change', () => {
      const isAnnual = toggle.checked;
      if (growthPrice) {
        growthPrice.textContent = isAnnual ? '$199' : '$249';
      }
      if (enterprisePrice) {
        enterprisePrice.textContent = isAnnual ? '$639' : '$799';
      }
      periodLabels.forEach((label) => {
        label.textContent = isAnnual ? '/mo (billed annually)' : '/month';
      });
    });
  }

  // 12. Pricing FAQ Accordion
  function initFaqAccordion() {
    const buttons = document.querySelectorAll('.faq-question-btn');
    if (!buttons.length) return;

    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const item = btn.closest('.faq-accordion-item');
        if (!item) return;

        const isCurrentlyActive = item.classList.contains('active');

        // Optional: close siblings or allow multiple open
        document.querySelectorAll('.faq-accordion-item').forEach((otherItem) => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherBtn = otherItem.querySelector('.faq-question-btn');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        if (isCurrentlyActive) {
          item.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // 13. Business Client Dashboard Controller
  function initDashboardTabs() {
    const tabButtons = document.querySelectorAll('.js-dashboard-tab-btn');
    const tabPanes = document.querySelectorAll('.js-dashboard-pane');
    const colLeft = document.getElementById('dashboardColLeft');
    const colRight = document.getElementById('dashboardColRight');
    const modulesGrid = document.getElementById('dashboardModulesGrid');
    const viewTitle = document.getElementById('dashViewTitle');
    const viewSubtitle = document.getElementById('dashViewSubtitle');

    // Mobile Drawer Controls
    const sidebar = document.getElementById('dashboardSidebar');
    const openBtn = document.getElementById('dashSidebarOpenBtn');
    const closeBtn = document.getElementById('dashSidebarCloseBtn');
    const backdrop = document.getElementById('dashSidebarBackdrop');

    const openSidebar = () => {
      if (sidebar) sidebar.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      document.body.classList.add('overflow-hidden');
    };

    const closeSidebar = () => {
      if (sidebar) sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
      document.body.classList.remove('overflow-hidden');
    };

    if (openBtn) openBtn.addEventListener('click', openSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (backdrop) backdrop.addEventListener('click', closeSidebar);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
        closeSidebar();
      }
    });

    if (!tabButtons.length) return;

    const titlesMap = {
      overview: {
        title: 'Overview',
        sub: 'Everything open on your refrigeration and retail loyalty facility account right now.'
      },
      tiers: {
        title: 'Reward Tiers Configuration Studio',
        sub: 'Configure tier points, multipliers, and cashier instant discounts across all 112 POS terminals.'
      },
      analytics: {
        title: 'Customer Engagement Analytics',
        sub: 'Real-time velocity, repeat visits, and digital wallet adoption.'
      },
      redemptions: {
        title: 'Active Service Tickets & POS Redemptions',
        sub: 'Live chronological POS redemptions across all store lanes.'
      },
      registers: {
        title: 'POS Registers & Fleet Health',
        sub: 'Register network calibration, live latency, and cashier lane sync.'
      }
    };

    tabButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = btn.getAttribute('data-tab');

        tabButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        // On mobile viewports, auto close the drawer on tab selection
        if (window.innerWidth < 1024) {
          closeSidebar();
        }

        // Dynamically update page header
        if (titlesMap[targetTab]) {
          if (viewTitle) viewTitle.textContent = titlesMap[targetTab].title;
          if (viewSubtitle) viewSubtitle.textContent = titlesMap[targetTab].sub;
        }

        if (targetTab === 'all' || targetTab === 'overview') {
          // Reset to Symmetrical 2-Column Overview Layout (50/50 Even Split)
          if (colLeft) {
            colLeft.style.display = 'block';
            colLeft.className = 'lg:col-span-6 space-y-6';
          }
          if (colRight) {
            colRight.style.display = 'block';
            colRight.className = 'lg:col-span-6 space-y-6';
          }
          if (modulesGrid) {
            modulesGrid.className = 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start';
          }
          tabPanes.forEach((pane) => {
            pane.style.display = 'block';
          });
        } else {
          // Single Tab Mode: Selected pane is placed 100% on the LEFT!
          tabPanes.forEach((pane) => {
            if (pane.id === `pane-${targetTab}`) {
              pane.style.display = 'block';
            } else {
              pane.style.display = 'none';
            }
          });

          if (targetTab === 'redemptions' || targetTab === 'tiers') {
            if (colLeft) {
              colLeft.style.display = 'block';
              colLeft.className = 'w-full space-y-6 lg:col-span-12';
            }
            if (colRight) {
              colRight.style.display = 'none';
            }
          } else if (targetTab === 'analytics' || targetTab === 'registers') {
            if (colLeft) {
              colLeft.style.display = 'none';
            }
            if (colRight) {
              colRight.style.display = 'block';
              colRight.className = 'w-full space-y-6 lg:col-span-12';
            }
          }

          if (modulesGrid) {
            modulesGrid.className = 'grid grid-cols-1 gap-6 items-start';
          }
        }
      });
    });

    // Tier Multiplier Slider Simulator
    const tierSlider = document.getElementById('dashTierMultiplierSlider');
    const tierMultiplierDisplay = document.getElementById('dashTierMultiplierVal');
    if (tierSlider && tierMultiplierDisplay) {
      tierSlider.addEventListener('input', () => {
        tierMultiplierDisplay.textContent = tierSlider.value + 'x';
      });
    }
  }
})();


