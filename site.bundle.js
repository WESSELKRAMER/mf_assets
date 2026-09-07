gsap.registerPlugin(ScrollTrigger, SplitText, Observer);

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

document.querySelectorAll('[data-split]').forEach((el) => {
  const type = el.dataset.split || 'lines';

  const split = new SplitText(el, {
    type: type,
    linesClass: 'split_line',
    wordsClass: 'split_word',
    charsClass: 'split_char'
  });

  const targets = type === 'chars' ? split.chars
    : type === 'words' ? split.words
    : split.lines;

  gsap.set(targets, { autoAlpha: 0, y: '0.6em' });

  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    onEnter: () => {
      gsap.to(targets, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.025,
        ease: 'power3.out'
      });
    }
  });
});

window.addEventListener('load', () => {
  const wrapper = document.querySelector('[data-nav-collapse="wrapper"]');
  const items = Array.from(wrapper.querySelectorAll('.nav_item'));
  const donate = wrapper.querySelector('[nav-item="donate"]');
  const topItem = items[0];

  gsap.set(donate, { zIndex: 10 });
  items.forEach((item, i) => {
    if (item !== donate) gsap.set(item, { zIndex: 5 - i });
  });

  const topRect = topItem.getBoundingClientRect();

  const tl = gsap.timeline({ paused: true });

  items.forEach(item => {
    const itemRect = item.getBoundingClientRect();
    const deltaY = topRect.top - itemRect.top;
    const isDonate = item === donate;

    tl.to(item, {
      y: deltaY,
      opacity: isDonate ? 1 : 0,
      ease: 'power2.out',
      duration: 0.4
    }, 0);
  });

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      if (self.direction === 1) {
        tl.play();
      } else if (self.direction === -1) {
        tl.reverse();
      }
    }
  });
});

function initAccordionCSS() {
  document.querySelectorAll('[data-accordion-css-init]').forEach((accordion) => {
    const closeSiblings = accordion.getAttribute('data-accordion-close-siblings') === 'true';

    accordion.querySelectorAll('[data-accordion-status="active"]').forEach((activeItem) => {
      const answer = activeItem.querySelector('.faq_answer');
      answer.style.height = answer.scrollHeight + 'px';
    });

    accordion.addEventListener('click', (event) => {
      const toggle = event.target.closest('[data-accordion-toggle]');
      if (!toggle) return;
      const singleAccordion = toggle.closest('[data-accordion-status]');
      if (!singleAccordion) return;

      const answer = singleAccordion.querySelector('.faq_answer');
      const isActive = singleAccordion.getAttribute('data-accordion-status') === 'active';

      singleAccordion.setAttribute('data-accordion-status', isActive ? 'not-active' : 'active');
      answer.style.height = isActive ? '0px' : answer.scrollHeight + 'px';

      if (closeSiblings && !isActive) {
        accordion.querySelectorAll('[data-accordion-status="active"]').forEach((sibling) => {
          if (sibling !== singleAccordion) {
            sibling.setAttribute('data-accordion-status', 'not-active');
            sibling.querySelector('.faq_answer').style.height = '0px';
          }
        });
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initAccordionCSS();
});

document.querySelectorAll('[data-nav-theme]').forEach((section) => {
  ScrollTrigger.create({
    trigger: section,
    start: 'top 80px',
    end: 'bottom 80px',
    onToggle: (self) => {
      if (self.isActive) {
        document.querySelector('[data-nav]').setAttribute('data-nav-theme', section.dataset.navTheme);
      }
    }
  });
});

document.querySelectorAll('.floating_img_wrapper').forEach((el, i) => {
  const distanceX = gsap.utils.random(8, 36);
  const distanceY = gsap.utils.random(10, 40);
  const duration = gsap.utils.random(3.5, 9.5);

  gsap.to(el, {
    x: `+=${distanceX}`,
    y: `-=${distanceY}`,
    duration: duration,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
    delay: i * 0.4
  });
});

function initDraggableMarquee() {
  const wrappers = document.querySelectorAll("[data-draggable-marquee-init]");

  const getNumberAttr = (el, name, fallback) => {
    const value = parseFloat(el.getAttribute(name));
    return Number.isFinite(value) ? value : fallback;
  };

  wrappers.forEach((wrapper) => {
    if (wrapper.getAttribute("data-draggable-marquee-init") === "initialized") return;

    const collection = wrapper.querySelector("[data-draggable-marquee-collection]");
    const list = wrapper.querySelector("[data-draggable-marquee-list]");
    if (!collection || !list) return;

    const duration = getNumberAttr(wrapper, "data-duration", 20);
    const multiplier = getNumberAttr(wrapper, "data-multiplier", 40);
    const sensitivity = getNumberAttr(wrapper, "data-sensitivity", 0.01);

    const wrapperWidth = wrapper.getBoundingClientRect().width;
    const listWidth = list.scrollWidth || list.getBoundingClientRect().width;
    if (!wrapperWidth || !listWidth) return;

    const minRequiredWidth = wrapperWidth + listWidth + 2;
    while (collection.scrollWidth < minRequiredWidth) {
      const listClone = list.cloneNode(true);
      listClone.setAttribute("data-draggable-marquee-clone", "");
      listClone.setAttribute("aria-hidden", "true");
      collection.appendChild(listClone);
    }

    const wrapX = gsap.utils.wrap(-listWidth, 0);

    gsap.set(collection, { x: 0 });

    const marqueeLoop = gsap.to(collection, {
      x: -listWidth,
      duration,
      ease: "none",
      repeat: -1,
      onReverseComplete: () => marqueeLoop.progress(1),
      modifiers: {
        x: (x) => wrapX(parseFloat(x)) + "px"
      },
    });

    const initialDirectionAttr = (wrapper.getAttribute("data-direction") || "left").toLowerCase();
    const baseDirection = initialDirectionAttr === "right" ? -1 : 1;

    const timeScale = { value: 1 };

    timeScale.value = baseDirection;
    wrapper.setAttribute("data-direction", baseDirection < 0 ? "right" : "left");

    if (baseDirection < 0) marqueeLoop.progress(1);

    function applyTimeScale() {
      marqueeLoop.timeScale(timeScale.value);
      wrapper.setAttribute("data-direction", timeScale.value < 0 ? "right" : "left");
    }

    applyTimeScale();

    const marqueeObserver = Observer.create({
      target: wrapper,
      type: "pointer,touch",
      preventDefault: true,
      debounce: false,
      onChangeX: (observerEvent) => {
        let velocityTimeScale = observerEvent.velocityX * -sensitivity;
        velocityTimeScale = gsap.utils.clamp(-multiplier, multiplier, velocityTimeScale);

        gsap.killTweensOf(timeScale);

        const restingDirection = velocityTimeScale < 0 ? -1 : 1;

        gsap.timeline({ onUpdate: applyTimeScale })
          .to(timeScale, { value: velocityTimeScale, duration: 0.1, overwrite: true })
          .to(timeScale, { value: restingDirection, duration: 1.0 });
      }
    });

    ScrollTrigger.create({
      trigger: wrapper,
      start: "top bottom",
      end: "bottom top",
      onEnter: () => { marqueeLoop.resume(); applyTimeScale(); marqueeObserver.enable(); },
      onEnterBack: () => { marqueeLoop.resume(); applyTimeScale(); marqueeObserver.enable(); },
      onLeave: () => { marqueeLoop.pause(); marqueeObserver.disable(); },
      onLeaveBack: () => { marqueeLoop.pause(); marqueeObserver.disable(); }
    });

    wrapper.setAttribute("data-draggable-marquee-init", "initialized");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initDraggableMarquee();
});

document.querySelectorAll('[data-team-slider]').forEach((sliderEl) => {
  const updateActive = (slider) => {
    const activeIdx = slider.track.details.rel;
    sliderEl.querySelectorAll('.team_slide').forEach((slide, i) => {
      slide.classList.toggle('is_active', i === activeIdx);
    });
  };

  const slider = new KeenSlider(sliderEl, {
    loop: true,
    centered: true,
    slides: { perView: 2.75, spacing: 0 },
    breakpoints: {
      '(min-width: 768px)': { slides: { perView: 2.2, spacing: 0 } },
      '(min-width: 1200px)': { slides: { perView: 2.75, spacing: 0 } }
    },
    slideChanged: updateActive
  });

  updateActive(slider);
});
