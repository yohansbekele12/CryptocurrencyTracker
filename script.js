const cryptoInput = document.querySelector(".cryptoInput");
const cryptoForm = document.querySelector(".cryptoForm");
const apiKey = "5a2da80f-e4e1-4669-874e-12312e1e2283";
const card = document.querySelector(".card");
const placeholder = document.querySelector(".placeholder");
let chartInstance=null; 

cryptoForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = cryptoInput.value.toLowerCase();
  if (name) {
    try {
      const cryptoData = await getCryptoData(name);
      displayCryptoData(cryptoData);
    } catch (error) {
      displayError(error);
    }
  } else {
    displayError("Please enter the Crypto Name or ID.");
  }
});

async function getCryptoData(name) {
  const response = await fetch(`http://localhost:3000/crypto/info?name=${name}`);
  const data = await response.json();
  console.log(data);

  if (!response.ok) {
    throw new Error("Couldn't find your DATA, please check the name.");
  }

  // Mock data for testing the chart
  data.time_labels = ['2023-07-23T10:00:00Z', '2023-07-23T11:00:00Z', '2023-07-23T12:00:00Z'];
  data.price_values = [30000, 31000, 32000];
  return data;
}

function displayCryptoData(data) {
  // Create DOM elements
  const cryptoImg = document.createElement('img');
  const cryptoName = document.createElement('h1');
  const price = document.createElement('p');
  const marketCap = document.createElement('p');
  const market_cap_dominance = document.createElement('p');
  const volumeDisplay = document.createElement('p');
  const percentageDisplayElement = document.createElement('p');

  // Set content for elements
  cryptoImg.src = data.logo;
  cryptoName.textContent = `${data.name}`;
  price.innerHTML = `Current Price <span class="value">${data.price.toFixed(1)} USD</span>`;
  marketCap.innerHTML = `Market CAP <span class="value">$ ${data.market_cap.toFixed(1)}</span>`;
  market_cap_dominance.innerHTML = `Market CAP Dominance <span class="value">$ ${data.market_cap_dominance}</span>`;
  const percentageDisplays = createPercentageDisplay(data);

  // Apply CSS classes
  cryptoImg.classList.add("cryptoImg");
  cryptoName.classList.add("nameDisplay");
  price.classList.add("marketDisplay");
  marketCap.classList.add("marketDisplay");
  market_cap_dominance.classList.add("marketDisplay");
  

  // Clear and display the card
  placeholder.style.display = "none";
  card.innerHTML = "";
  card.style.display = "flex";
  
  card.appendChild(cryptoImg);
  card.appendChild(cryptoName);
  card.appendChild(price);
  card.appendChild(marketCap);
  card.appendChild(market_cap_dominance);
  card.appendChild(percentageDisplays);

  // Chart display
  displayCryptoChart({
    name: data.name,
    labels: data.time_labels, // Replace with actual time labels
    prices: data.price_values // Replace with actual price values
  });
}

function createPercentageDisplay(data) {
  // Create a container for percentage display
  const container = document.createElement('div');
  container.classList.add('percentageDisplay'); // Add a class for styling

  // Create and style the change value element
  const changeValueElement = document.createElement('p');
  const percentageChange = data.percent_change_1h !== undefined ? data.percent_change_1h : 0;
  const isIncreasing = percentageChange > 0;
  const changeClass = isIncreasing ? 'increase' : 'decrease';
  changeValueElement.innerHTML = `<span class="marketDisplay">Change 1H USD </span>${percentageChange.toFixed(2)}%`;
  changeValueElement.classList.add(changeClass);

  // Create and style the arrow element
  const changeArrowElement = document.createElement('span');
  const arrowClass = isIncreasing ? 'arrow-up' : 'arrow-down';
  changeArrowElement.classList.add(arrowClass);

  // Append both elements to the container
  container.appendChild(changeValueElement);
  container.appendChild(changeArrowElement);

  return container;
}

function displayCryptoChart(data) {
  const ctx = document.getElementById('myChart').getContext('2d');
  if (chartInstance !== null) {
    chartInstance.destroy();
  }
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels, // Array of time labels
      datasets: [{
        label: `${data.name} Price`,
        data: data.prices, // Array of prices corresponding to the labels
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'hour'
          }
        },
        y: {
          beginAtZero: false
        }
      }
    }
  });
}

function displayError(message) {
  const errorDisplay = document.createElement('p');

  errorDisplay.textContent = message;
  errorDisplay.classList.add("errorDisplay");

  card.innerHTML = "";
  card.style.display = "flex";
  card.appendChild(errorDisplay);
}
