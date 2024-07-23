document.addEventListener("DOMContentLoaded", function() {
  const fromDate = document.getElementById('from-date');
  const toDate = document.getElementById('to-date');
  let selectedProduct = null; // Variable to store the selected product name

  // Set default date range to June 1, 2024 - June 30, 2024
  fromDate.value = '2024-06-01';
  toDate.value = '2024-06-30';

  fromDate.addEventListener('change', () => {
    console.log('From date changed:', fromDate.value);
    updateCharts(selectedProduct);
  });
  toDate.addEventListener('change', () => {
    console.log('To date changed:', toDate.value);
    updateCharts(selectedProduct);
  });

  fetch('/data/products/list')
    .then(response => response.json())
    .then(products => {
      console.log("Product list data: ", products); // Log product list data
      const productList = document.getElementById('product-list');
      productList.innerHTML = '';

      products.forEach(product => {
        const listItem = document.createElement('a');
        listItem.className = 'nav-link';
        listItem.href = '#';
        listItem.textContent = product.product_name;
        listItem.addEventListener('click', () => {
          selectedProduct = product.product_name; // Update the selected product name
          console.log('Selected product:', selectedProduct);
          loadProductData(selectedProduct);
        });
        productList.appendChild(listItem);
      });

      const defaultProduct = products[0].product_name;
      console.log("Default product: ", defaultProduct); // Log default product
      selectedProduct = defaultProduct; // Set the default selected product name
      loadProductData(defaultProduct);
    })
    .catch(error => console.error('Error fetching product list:', error));
});

function loadProductData(product) {
  console.log("Loading data for product: ", product); // Log the selected product
  const encodedProduct = encodeURIComponent(product);
  console.log("Encoded product: ", encodedProduct); // Log the encoded product

  updateCharts(encodedProduct);
}

function updateCharts(encodedProduct) {
  const fromDateValue = document.getElementById('from-date').value;
  const toDateValue = document.getElementById('to-date').value;

  console.log('Updating charts for product:', encodedProduct, 'from date:', fromDateValue, 'to date:', toDateValue);

  if (!fromDateValue || !toDateValue || !encodedProduct) return;

  // Fetch and render the weight plot
  fetch(`/data/products/plot/weight/${encodedProduct}?from=${fromDateValue}&to=${toDateValue}`)
    .then(response => response.text())
    .then(plotHtml => {
      console.log("Weight plot HTML: ", plotHtml); // Log the weight plot HTML
      document.getElementById('chart1').innerHTML = plotHtml;
      executeScripts(document.getElementById('chart1'));
    })
    .catch(error => console.error('Error fetching weight plot:', error));

  // Fetch and render the height plot
  fetch(`/data/products/plot/height/${encodedProduct}?from=${fromDateValue}&to=${toDateValue}`)
    .then(response => response.text())
    .then(plotHtml => {
      console.log("Height plot HTML: ", plotHtml); // Log the height plot HTML
      document.getElementById('chart2').innerHTML = plotHtml;
      executeScripts(document.getElementById('chart2'));
    })
    .catch(error => console.error('Error fetching height plot:', error));

  // Fetch and render the weight statistics
  fetch(`/data/products/describe/weight/${encodedProduct}?from=${fromDateValue}&to=${toDateValue}`)
  .then(response => response.json())
  .then(data => {
    console.log("Weight description response: ", data); // Log the weight description response
    const statsWeightBody = document.getElementById('stats-weight');
    statsWeightBody.innerHTML = '';

    if (data.length > 0) {
      const item = data[0];
      const keys = ['Product', 'Count', 'Min', 'Max', 'Average', 'Pct In Spec', 'Count Offspec', 'Compliant'];
      keys.forEach(key => {
        const row = document.createElement('tr');

        const keyCell = document.createElement('th');
        keyCell.scope = 'row';
        keyCell.textContent = key;

        const valueCell = document.createElement('td');
        if (key === 'Compliant') {
          valueCell.textContent = item[key] ? 'Yes' : 'No';
          if (!item[key]) {
            row.classList.add('table-danger');
          } else {
            row.classList.add('table-dark');
          }
        } else {
          valueCell.textContent = item[key];
          if (key === 'Pct In Spec' && parseFloat(item[key]) < 95) {
            row.classList.add('table-danger');
          } else {
            row.classList.add('table-dark');
          }
        }

        row.appendChild(keyCell);
        row.appendChild(valueCell);
        statsWeightBody.appendChild(row);
      });
    }
  })
  .catch(error => console.error('Error fetching weight statistics:', error));

  // Fetch and render the height statistics
  fetch(`/data/products/describe/height/${encodedProduct}?from=${fromDateValue}&to=${toDateValue}`)
  .then(response => response.json())
  .then(data => {
    console.log("Height description response: ", data); // Log the height description response
    const statsHeightBody = document.getElementById('stats-height');
    statsHeightBody.innerHTML = '';

    if (data.length > 0) {
      const item = data[0];
      const keys = ['Product', 'Count', 'Min', 'Max', 'Average', 'Pct In Spec', 'Count Offspec', 'Compliant'];
      keys.forEach(key => {
        const row = document.createElement('tr');

        const keyCell = document.createElement('th');
        keyCell.scope = 'row';
        keyCell.textContent = key;

        const valueCell = document.createElement('td');
        if (key === 'Compliant') {
          valueCell.textContent = item[key] ? 'Yes' : 'No';
          if (!item[key]) {
            row.classList.add('table-danger');
          } else {
            row.classList.add('table-dark');
          }
        } else {
          valueCell.textContent = item[key];
          if (key === 'Pct In Spec' && parseFloat(item[key]) < 95) {
            row.classList.add('table-danger');
          } else {
            row.classList.add('table-dark');
          }
        }

        row.appendChild(keyCell);
        row.appendChild(valueCell);
        statsHeightBody.appendChild(row);
      });
    }
  })
  .catch(error => console.error('Error fetching height statistics:', error));
}

function executeScripts(element) {
  const scripts = element.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    const script = document.createElement('script');
    script.type = scripts[i].type || 'text/javascript';
    if (scripts[i].src) {
      script.src = scripts[i].src;
    } else {
      script.textContent = scripts[i].textContent;
    }
    document.head.appendChild(script);
  }
}

