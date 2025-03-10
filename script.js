document.addEventListener("DOMContentLoaded", () => {
  //// NAV LINKS UNDERLINING
  const links = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".section");

  // check which section is in view
  function checkSectionInView() {
    let currentSection = null;

    sections.forEach((section) => {
      const sectionRect = section.getBoundingClientRect();

      if (
        sectionRect.top <= window.innerHeight / 2 &&
        sectionRect.bottom >= window.innerHeight / 2
      ) {
        currentSection = section.id;
      }
    });

    // underline link with active class
    links.forEach((link) => {
      if (link.getAttribute("href") === `#${currentSection}`) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  window.addEventListener("scroll", checkSectionInView);

  //// PRODUCTS LIST
  const productsContainer = document.querySelector(".products-container");
  const pageSizeSelect = document.querySelector("#products-quantity");

  let currentPage = 1;
  let currentPageSize = 20;
  let isProductsLoaded = false;
  let isFetching = false;
  let hasMore = true;

  // product card template
  const createProductCard = (product) => `
      <div class="product-card" 
      data-name="${product.text}"  
      data-product-id="${product.id}" >
      <p>ID: ${product.id}</p>
      </div>
    `;

  // products fetching
  const loadProducts = async (pageSize, pageNumber = 1, append = false) => {
    if (isFetching || !hasMore) return;

    try {
      isFetching = true;
      const response = await fetch(
        `https://brandstestowy.smallhost.pl/api/random?pageNumber=${pageNumber}&pageSize=${pageSize}`
      );

      if (!response.ok) throw new Error("Data fetch error");

      const data = await response.json();
      hasMore = data.data.length >= pageSize;
      console.log(`Page: ${pageNumber}, Size: ${pageSize}`, data); // Debug info

      if (append) {
        productsContainer.innerHTML += data.data
          .map((product) => createProductCard(product))
          .join("");
      } else {
        productsContainer.innerHTML = data.data
          .map((product) => createProductCard(product))
          .join("");
      }
    } catch (error) {
      productsContainer.innerHTML = `<p class="error">${error.message}</p>`;
    } finally {
      isFetching = false;
      if (hasMore) setupInfiniteScroll();
    }
  };
  // infinite scroll
  const setupInfiniteScroll = () => {
    const lastProduct = document.querySelector(".product-card:last-child");
    if (!lastProduct) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          currentPage++;
          loadProducts(currentPageSize, currentPage, true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px", threshold: 1.0 }
    );

    observer.observe(lastProduct);
  };

  // first products render
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !isProductsLoaded) {
        loadProducts(currentPageSize, 1);
        isProductsLoaded = true;
        observer.disconnect();
      }
    },
    {
      rootMargin: "100px",
      threshold: 1.0,
    }
  );

  const sentinel = document.querySelector(".products-container");
  observer.observe(sentinel);

  pageSizeSelect.addEventListener("change", (e) => {
    currentPage = 1;
    currentPageSize = parseInt(e.target.value);
    hasMore = true;
    productsContainer.innerHTML = "";
    loadProducts(currentPageSize, 1);
  });

  //// POPUP
  const modal = document.getElementById("product-modal");
  const productId = document.getElementById("product-id");
  const productTitle = document.getElementById("product-title");
  const productPrice = document.getElementById("product-price");
  const closeModalBtn = document.querySelector(".close-btn");

  let productValue = 100; // hardcoded coz do not have it in fetched data

  // popup open fn
  function openModal(product) {
    productId.innerText = product.id;
    productTitle.innerText = product.name;
    productPrice.innerText = productValue;

    modal.style.display = "flex";
  }

  // popup close
  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // popup close - click on bg
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // handle product click
  document
    .querySelector(".products-container")
    .addEventListener("click", (e) => {
      const productCard = e.target.closest(".product-card");
      if (!productCard) return;

      const product = {
        id: productCard.dataset.productId,
        name: productCard.dataset.name,
      };

      openModal(product);
    });

  //// slide menu
  const menu = document.querySelector(".modal-menu");
  const bg = document.querySelector(".modal-bg");
  const hamburger = document.querySelector("#hamburger-menu");

  //handle hamburger icon click
  hamburger.addEventListener("click", () => {
    menu.classList.toggle("active");
    bg.classList.toggle("active");
  });

  //handle bg click
  bg.addEventListener("click", () => {
    menu.classList.remove("active");
    bg.classList.remove("active");
  });
});
