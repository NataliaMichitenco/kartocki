
class ProductCard {
  constructor(apiUrl, containerSelector, templateSelector) {
    this.apiUrl = apiUrl;
    this.container = document.querySelector(containerSelector);
    this.template = document.querySelector(templateSelector);
    this.init();
  }

  async init() {
    if (!this.container || !this.template) {
      console.error('Контейнер или шаблон не найдены!');
      return;
    }
    try {
      const products = await this.fetchProducts();
      this.renderProducts(products);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  }

  async fetchProducts() {
    const response = await fetch(this.apiUrl);
    if (!response.ok) throw new Error('Ошибка загрузки продуктов');
    return response.json();
  }

  renderProducts(products) {
    products.forEach(product => {
      const card = this.template.cloneNode(true);
      card.classList.remove('template');
      card.style.display = 'flex';

      const img = card.querySelector('.products__img');
      const title = card.querySelector('.products__title');
      const price = card.querySelector('.products__price');
      const btnDescription = card.querySelector('.products__description');
      const btnBuy = card.querySelector('.products__buy');

      img.src = product.image;
      img.alt = product.title;
      title.textContent = product.title;
      price.textContent = `${product.price} $`;

      const cart = ShoppingCart.getCart();
      const existingProduct = cart.find(item => item.id === product.id);

      if (existingProduct) {
        this.disableBuyButton(btnBuy);
      } else {
        this.enableBuyButton(btnBuy, product);
      }

      btnDescription.onclick = () => this.showModal(product);

      this.container.appendChild(card);
    });
  }

  showModal(product) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalRating = document.getElementById('modalRating');
    const closeModalBtn = document.getElementById('closeModal');

    modalTitle.textContent = product.title;
    modalDescription.textContent = product.description || 'Нет описания';
    modalRating.textContent = `Rating: ${product.rating.rate}`;
    modalRating.style.color = '#327662';

    modal.style.display = 'block';

    closeModalBtn.onclick = () => {
      modal.style.display = 'none';
    };

    window.onclick = event => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    };
  }

  disableBuyButton(btnBuy) {
    btnBuy.disabled = true;
    btnBuy.textContent = 'Добавлено в корзину';
    btnBuy.style.fontSize = '20px';
    btnBuy.style.background = '#CFD0CF';
  }

  enableBuyButton(btnBuy, product) {
    btnBuy.disabled = false;
    btnBuy.textContent = 'Купить';
    btnBuy.onclick = () => {
      ShoppingCart.addToCart(product);
      this.disableBuyButton(btnBuy);
    };
  }
}

class ShoppingCart {
  static getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
  }

  static addToCart(product) {
    const cart = this.getCart();
    const existingProduct = cart.find(item => item.id === product.id);

    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      product.quantity = 1;
      cart.push(product);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    
  }

  static updateCartDisplay() {
    const cart = this.getCart();
    const cartList = document.getElementById('cart__li');
    const totalAmount = document.getElementById('totalAmount');
    const clearCartBtn = document.getElementById('clearCart');

    cartList.innerHTML = '';

    if (cart.length === 0) {
      cartList.innerHTML = '<p>Корзина пуста</p>';
      totalAmount.textContent = 'Сумма: 0 $';
      return;
    }

    let total = 0;

    cart.forEach((product, index) => {
      const listItem = document.createElement('li');
      listItem.classList.add('cart-item');
      listItem.style.display = 'flex';
      listItem.style.alignItems = 'center';
      listItem.style.gap = '20px';

      const img = document.createElement('img');
      img.src = product.image;
      img.alt = product.title;
      img.style.width = '50px';
      img.style.height = '50px';

      const title = document.createElement('p');
      title.textContent = product.title;
      title.style.fontSize = '18px';

      const price = document.createElement('p');
      price.textContent = `Цена: ${product.price} $`;
      price.style.fontSize = '20px';
      price.style.color = '#327662';

      const quantityContainer = this.createQuantityControls(product, cart, index);

      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Удалить';
      removeBtn.style.fontSize = '20px';
      removeBtn.style.border = 'none';
      removeBtn.style.background = 'none';
      removeBtn.onclick = () => {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartDisplay();
      };

      listItem.appendChild(img);
      listItem.appendChild(title);
      listItem.appendChild(price);
      listItem.appendChild(quantityContainer);
      listItem.appendChild(removeBtn);

      cartList.appendChild(listItem);

      total += product.price * product.quantity;
    });

    totalAmount.textContent = `Сумма: ${total.toFixed(2)} $`;

    clearCartBtn.onclick = () => {
      localStorage.removeItem('cart');
      this.updateCartDisplay();
    };
  }

  static createQuantityControls(product, cart, index) {
    const quantityContainer = document.createElement('div');
    quantityContainer.classList.add('quantity-container');

    const decrementBtn = document.createElement('button');
    decrementBtn.textContent = '−';
    decrementBtn.style.fontSize = '20px';
    decrementBtn.style.padding = '5px';
    decrementBtn.style.border = 'none';
    decrementBtn.style.background = 'none';
    decrementBtn.onclick = () => {
      if (product.quantity > 1) {
        product.quantity--;
      } else {
        cart.splice(index, 1);
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      this.updateCartDisplay();
    };

    const quantity = document.createElement('span');
    quantity.textContent = product.quantity;

    const incrementBtn = document.createElement('button');
    incrementBtn.textContent = '+';
    incrementBtn.style.fontSize = '20px';
    incrementBtn.style.padding = '5px';
    incrementBtn.style.border = 'none';
    incrementBtn.style.background = 'none';
    incrementBtn.onclick = () => {
      product.quantity++;
      localStorage.setItem('cart', JSON.stringify(cart));
      this.updateCartDisplay();
    };

    quantityContainer.appendChild(decrementBtn);
    quantityContainer.appendChild(quantity);
    quantityContainer.appendChild(incrementBtn);

    return quantityContainer;
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  new ProductCard('https://fakestoreapi.com/products?limit=20', '.sectionCards', '.products.template');
  ShoppingCart.updateCartDisplay();
});


