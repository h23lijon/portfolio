/* --- 1. Kalkylator-logik --- */
const calcButton = document.getElementById('calculate-button');

if (calcButton) {
  calcButton.addEventListener('click', function(e) {
    e.preventDefault();

    const beer = parseInt(document.getElementById('beer').value) || 0;
    const wine = parseInt(document.getElementById('wine').value) || 0;
    const spirits = parseInt(document.getElementById('spirits').value) || 0;

    const resultBox = document.getElementById('result');
    const errorMessage = document.getElementById('error-message');

    // Nollställ visning
    if (resultBox) resultBox.classList.add('hidden');
    if (errorMessage) errorMessage.classList.add('hidden');

    if (beer === 0 && wine === 0 && spirits === 0) {
      if (errorMessage) {
        errorMessage.textContent = "Fyll i minst ett dryckesalternativ för att se uträkningen";
        errorMessage.classList.remove('hidden');
      }
      return;
    }

    // --- BERÄKNINGAR ---
    // CO2 (gram per månad)
    const totalCO2 = (beer * 176) + (wine * 664) + (spirits * 894);
    const totalCO2kg = (totalCO2 / 1000).toFixed(1);
    const yearlyCO2 = (totalCO2 * 12 / 1000);
    
    // Gränsvärde för genomsnitt (kg per år)
    const avgSwedeCO2Year = 48; 

    // --- SKAPA MEDDELANDE ---
    let message = "";

    if (yearlyCO2 < avgSwedeCO2Year) {
      // POSITIVT SVAR
      message += `<strong class="result-heading">🌱 Härligt! Du bidrar till mindre utsläpp än genomsnittet</strong>`;
      message += `<p>Din konsumtion orsakar ca <strong>${totalCO2kg} kg</strong> CO₂ per månad.</p>`;
      message += `<p style="font-size: 0.8rem; margin-top: 10px; opacity: 0.9;">Detta motsvarar ca ${yearlyCO2.toFixed(0)} kg per år.</p>`;
      message += `<div class='result-subtext' style="margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px;">
        Din klimatpåverkan vad gäller alkoholkonsumtion är låg – och det skålar vi för (med måtta)! 🥂
      </div>`;
    } else {
      // NEGATIVT SVAR
      message += `<strong class="result-heading">⚡ Ooops! Du bidrar till mer utsläpp än genomsnittet.</strong>`;
      message += `<p>Din konsumtion orsakar ca <strong>${totalCO2kg} kg</strong> CO₂ per månad.</p>`;
      message += `<p style="font-size: 0.8rem; margin-top: 10px; opacity: 0.9;">Detta motsvarar ca ${yearlyCO2.toFixed(0)} kg per år.</p>`;
      message += `<div class='result-subtext' style="margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px;">
        Det kanske blivit ett par glas för mycket för klimatet 😅 Men små förändringar gör stor skillnad. Testa alkoholfritt nästa gång!
      </div>`;
    }

    // --- VISA RESULTAT ---
    if (resultBox) {
      resultBox.innerHTML = message;
      resultBox.style.backgroundColor = "rgba(39, 60, 118, 0.7)";
      resultBox.style.color = "#fff";
      resultBox.classList.remove('hidden');
    }
  });
}
/* --- 2. Tema-växlare --- */
const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;

const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
  body.classList.add('dark-mode');
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  });
}

/* --- 3. Kart-data och Logik --- */
const consumptionData = {
  "Stockholm": 4.4, "Uppsala": 3.9, "Södermanland": 3.6, "Östergötland": 3.9,
  "Jönköping": 3.3, "Kronoberg": 3.6, "Kalmar": 3.5, "Gotland": 4.0,
  "Blekinge": 3.6, "Skåne": 3.9, "Halland": 3.7, "Västra Götaland": 3.9,
  "Värmland": 3.6, "Örebro": 3.5, "Västmanland": 3.4, "Dalarna": 3.4,
  "Gävleborg": 3.5, "Västernorrland": 3.5, "Jämtland": 3.5,
  "Västerbotten": 3.6, "Norrbotten": 3.5
};

fetch('swedish_regions.geojson')
  .then(res => {
    if (!res.ok) throw new Error('GeoJSON kunde inte hämtas');
    return res.json();
  })
  .then(geojson => {
    const locations = Object.keys(consumptionData);
    const zValues = Object.values(consumptionData);

    const data = [{
      type: 'choroplethmapbox',
      geojson: geojson,
      locations: locations,
      z: zValues,
      colorscale: [
        [0, '#C3CAE9'], 
        [1, '#1C2E7C']  
      ],
      colorbar: { title: 'Liter/år', thickness: 10 },
      marker: { line: { width: 0.5, color: 'gray' } },
      featureidkey: 'properties.name'
    }];

    const layout = {
      mapbox: {
        style: 'carto-positron',
        center: { lon: 16.5, lat: 62 },
        zoom: 3
      },
      margin: { t: 0, b: 0, l: 0, r: 0 },
      autosize: true
    };

    Plotly.newPlot('map', data, layout, { responsive: true, displayModeBar: false });
  })
  .catch(error => {
    console.error('Kartfel:', error);
    const mapDiv = document.getElementById('map');
    if (mapDiv) mapDiv.innerHTML = "<p style='padding:20px;'>Kartan kunde inte laddas. Kontrollera att swedish_regions.geojson finns i mappen.</p>";
  });