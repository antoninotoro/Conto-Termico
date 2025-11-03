// Costanti e parametri del Conto Termico 3.0

const ZONE_CLIMATICHE = ['A', 'B', 'C', 'D', 'E', 'F'];

// Coefficienti di valorizzazione Ci per zona climatica (€/kWht) - valori indicativi
const COEFF_VALORIZZAZIONE = {
    'A': 0.055,
    'B': 0.065,
    'C': 0.075,
    'D': 0.085,
    'E': 0.095,
    'F': 0.105
};

// Coefficienti di utilizzo Quf per zona climatica (valori indicativi)
const COEFF_UTILIZZO = {
    'A': 0.3,
    'B': 0.4,
    'C': 0.5,
    'D': 0.6,
    'E': 0.7,
    'F': 0.8
};

// Variabili globali
let interventoSelezionato = null;
let datiIntervento = {};

// Funzione per mostrare il form appropriato in base alla tipologia selezionata
function mostraFormIntervento() {
    const select = document.getElementById('intervento-tipo');
    interventoSelezionato = select.value;
    const container = document.getElementById('form-container');
    const calcBtn = document.getElementById('calcola-btn');
    const results = document.getElementById('results');

    // Nascondi risultati precedenti
    results.style.display = 'none';

    if (!interventoSelezionato) {
        container.innerHTML = '';
        calcBtn.style.display = 'none';
        return;
    }

    let formHTML = '';

    switch (interventoSelezionato) {
        case 'A1':
            formHTML = getFormA1();
            break;
        case 'A2':
            formHTML = getFormA2();
            break;
        case 'A3':
            formHTML = getFormA3();
            break;
        case 'A4':
            formHTML = getFormA4();
            break;
        case 'A5':
            formHTML = getFormA5();
            break;
        case 'B1':
            formHTML = getFormB1();
            break;
        case 'B2':
            formHTML = getFormB2();
            break;
        case 'B3':
            formHTML = getFormB3();
            break;
        case 'B4':
            formHTML = getFormB4();
            break;
    }

    container.innerHTML = formHTML;
    calcBtn.style.display = 'block';
}

// Form A.1 - Isolamento Termico
function getFormA1() {
    return `
        <h3>A.1 - Isolamento Termico (Superfici opache)</h3>
        <div class="form-group">
            <label>Zona Climatica:</label>
            <select id="zonaClimatica">
                ${ZONE_CLIMATICHE.map(z => `<option value="${z}">${z}</option>`).join('')}
            </select>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Superficie oggetto intervento (m²):</label>
                <input type="number" id="superficie" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Costo specifico sostenuto (€/m²):</label>
                <input type="number" id="costoSpecifico" min="0" step="0.01" required>
            </div>
        </div>
        <div class="form-group">
            <label>Spesa totale sostenuta (€):</label>
            <input type="number" id="spesaTotale" min="0" step="0.01" required>
        </div>
        <div class="checkbox-group">
            <input type="checkbox" id="multiIntervento">
            <label for="multiIntervento">Multi-intervento con Art. 8 (maggiorazione 55%)</label>
        </div>
        <div class="checkbox-group">
            <input type="checkbox" id="prodottoUE">
            <label for="prodottoUE">Componenti prodotti in UE (+10%)</label>
        </div>
    `;
}

// Form A.2 - Sostituzione Chiusure Trasparenti
function getFormA2() {
    return `
        <h3>A.2 - Sostituzione Chiusure Trasparenti</h3>
        <div class="form-group">
            <label>Zona Climatica:</label>
            <select id="zonaClimatica">
                ${ZONE_CLIMATICHE.map(z => `<option value="${z}">${z}</option>`).join('')}
            </select>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Superficie oggetto intervento (m²):</label>
                <input type="number" id="superficie" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Costo specifico sostenuto (€/m²):</label>
                <input type="number" id="costoSpecifico" min="0" step="0.01" required>
            </div>
        </div>
        <div class="form-group">
            <label>Spesa totale sostenuta (€):</label>
            <input type="number" id="spesaTotale" min="0" step="0.01" required>
        </div>
        <div class="checkbox-group">
            <input type="checkbox" id="prodottoUE">
            <label for="prodottoUE">Componenti prodotti in UE (+10%)</label>
        </div>
    `;
}

// Form A.3 - Trasformazione NZEB
function getFormA3() {
    return `
        <h3>A.3 - Trasformazione NZEB</h3>
        <div class="form-group">
            <label>Zona Climatica:</label>
            <select id="zonaClimatica">
                ${ZONE_CLIMATICHE.map(z => `<option value="${z}">${z}</option>`).join('')}
            </select>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Superficie utile edificio (m²):</label>
                <input type="number" id="superficieEdificio" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Costo specifico sostenuto (€/m²):</label>
                <input type="number" id="costoSpecifico" min="0" step="0.01" required>
            </div>
        </div>
        <div class="form-group">
            <label>Spesa totale sostenuta (€):</label>
            <input type="number" id="spesaTotale" min="0" step="0.01" required>
        </div>
        <div class="checkbox-group">
            <input type="checkbox" id="prodottoUE">
            <label for="prodottoUE">Componenti prodotti in UE (+10%)</label>
        </div>
    `;
}

// Form A.4 - Building Automation
function getFormA4() {
    return `
        <h3>A.4 - Building Automation</h3>
        <div class="form-row">
            <div class="form-group">
                <label>Superficie utile edificio (m²):</label>
                <input type="number" id="superficieEdificio" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Costo specifico sostenuto (€/m²):</label>
                <input type="number" id="costoSpecifico" min="0" step="0.01" required>
            </div>
        </div>
        <div class="form-group">
            <label>Spesa totale sostenuta (€):</label>
            <input type="number" id="spesaTotale" min="0" step="0.01" required>
        </div>
        <div class="checkbox-group">
            <input type="checkbox" id="prodottoUE">
            <label for="prodottoUE">Componenti prodotti in UE (+10%)</label>
        </div>
    `;
}

// Form A.5 - Fotovoltaico e Accumulo
function getFormA5() {
    return `
        <h3>A.5 - Fotovoltaico e Accumulo</h3>
        <div class="info">
            Deve essere abbinato a sostituzione impianto con pompa di calore elettrica.
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Potenza Fotovoltaico (kW):</label>
                <input type="number" id="potenzaFV" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Spesa Fotovoltaico (€):</label>
                <input type="number" id="spesaFV" min="0" step="0.01" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Capacità Accumulo (kWh):</label>
                <input type="number" id="capacitaAccumulo" min="0" step="0.01">
            </div>
            <div class="form-group">
                <label>Spesa Accumulo (€):</label>
                <input type="number" id="spesaAccumulo" min="0" step="0.01">
            </div>
        </div>
        <div class="form-group">
            <label>Incentivo pompa di calore abbinata (€):</label>
            <input type="number" id="incentivoPC" min="0" step="0.01" required>
        </div>
    `;
}

// Form B.1 - Pompe di Calore Elettriche
function getFormB1() {
    return `
        <h3>B.1 - Pompe di Calore Elettriche</h3>
        <div class="form-group">
            <label>Zona Climatica:</label>
            <select id="zonaClimatica">
                ${ZONE_CLIMATICHE.map(z => `<option value="${z}">${z}</option>`).join('')}
            </select>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Potenza nominale (kW):</label>
                <input type="number" id="potenza" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label>SCOP (Coefficiente di Prestazione Stagionale):</label>
                <input type="number" id="scop" min="0" step="0.01" required>
            </div>
        </div>
        <div class="form-group">
            <label>Spesa totale sostenuta (€):</label>
            <input type="number" id="spesaTotale" min="0" step="0.01" required>
        </div>
    `;
}

// Form B.2 - Sistemi Ibridi/Bivalenti
function getFormB2() {
    return `
        <h3>B.2 - Sistemi Ibridi/Bivalenti</h3>
        <div class="form-group">
            <label>Tipologia Sistema:</label>
            <select id="tipoSistema">
                <option value="ibrido-fm">Ibrido Factory Made (k=1.25)</option>
                <option value="bivalente-35">Bivalente ≤35 kW (k=1.0)</option>
                <option value="bivalente-35p">Bivalente >35 kW (k=1.1)</option>
            </select>
        </div>
        <div class="form-group">
            <label>Zona Climatica:</label>
            <select id="zonaClimatica">
                ${ZONE_CLIMATICHE.map(z => `<option value="${z}">${z}</option>`).join('')}
            </select>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Potenza nominale pompa di calore (kW):</label>
                <input type="number" id="potenza" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label>SCOP (Coefficiente di Prestazione Stagionale):</label>
                <input type="number" id="scop" min="0" step="0.01" required>
            </div>
        </div>
        <div class="form-group">
            <label>Spesa totale sostenuta (€):</label>
            <input type="number" id="spesaTotale" min="0" step="0.01" required>
        </div>
    `;
}

// Form B.3 - Scaldacqua a Pompa di Calore
function getFormB3() {
    return `
        <h3>B.3 - Scaldacqua a Pompa di Calore</h3>
        <div class="form-row">
            <div class="form-group">
                <label>Classe Energetica:</label>
                <select id="classeEnergetica">
                    <option value="A">Classe A</option>
                    <option value="A+">Classe A+</option>
                </select>
            </div>
            <div class="form-group">
                <label>Capacità (litri):</label>
                <input type="number" id="capacita" min="0" step="1" required>
            </div>
        </div>
        <div class="form-group">
            <label>Spesa totale sostenuta (€):</label>
            <input type="number" id="spesaTotale" min="0" step="0.01" required>
        </div>
    `;
}

// Form B.4 - Allaccio a Teleriscaldamento
function getFormB4() {
    return `
        <h3>B.4 - Allaccio a Teleriscaldamento Efficiente</h3>
        <div class="form-row">
            <div class="form-group">
                <label>Potenza nominale sottostazione (kW):</label>
                <input type="number" id="potenza" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Costo specifico sostenuto (€/kW):</label>
                <input type="number" id="costoSpecifico" min="0" step="0.01" required>
            </div>
        </div>
        <div class="form-group">
            <label>Spesa totale sostenuta (€):</label>
            <input type="number" id="spesaTotale" min="0" step="0.01" required>
        </div>
    `;
}

// Funzione principale di calcolo
function calcolaIncentivo() {
    if (!interventoSelezionato) {
        alert('Seleziona una tipologia di intervento');
        return;
    }

    let risultato = null;

    try {
        switch (interventoSelezionato) {
            case 'A1':
                risultato = calcolaA1();
                break;
            case 'A2':
                risultato = calcolaA2();
                break;
            case 'A3':
                risultato = calcolaA3();
                break;
            case 'A4':
                risultato = calcolaA4();
                break;
            case 'A5':
                risultato = calcolaA5();
                break;
            case 'B1':
                risultato = calcolaB1();
                break;
            case 'B2':
                risultato = calcolaB2();
                break;
            case 'B3':
                risultato = calcolaB3();
                break;
            case 'B4':
                risultato = calcolaB4();
                break;
        }

        if (risultato) {
            mostraRisultati(risultato);
        }
    } catch (error) {
        alert('Errore nel calcolo: ' + error.message);
    }
}

// Calcolo A.1 - Isolamento Termico
function calcolaA1() {
    const zonaClimatica = document.getElementById('zonaClimatica').value;
    const superficie = parseFloat(document.getElementById('superficie').value);
    const costoSpecifico = parseFloat(document.getElementById('costoSpecifico').value);
    const spesaTotale = parseFloat(document.getElementById('spesaTotale').value);
    const multiIntervento = document.getElementById('multiIntervento').checked;
    const prodottoUE = document.getElementById('prodottoUE').checked;

    // % spesa base
    let percSpesa = 0.40;

    // Maggiorazioni
    if (zonaClimatica === 'E' || zonaClimatica === 'F') {
        percSpesa = 0.50;
    }
    if (multiIntervento) {
        percSpesa = 0.55;
    }
    if (prodottoUE) {
        percSpesa += 0.10;
    }

    // Calcolo incentivo teorico
    const incentivoTeorico = percSpesa * costoSpecifico * superficie;

    // Applicazione vincoli
    const Imax = 1000000; // €
    const limite65 = spesaTotale * 0.65;

    const incentivoFinale = Math.min(incentivoTeorico, Imax, limite65);

    const vincoloApplicato =
        incentivoFinale === Imax ? 'Imax (1.000.000 €)' :
        incentivoFinale === limite65 ? '65% spesa sostenuta' :
        'Nessun vincolo';

    return {
        tipo: 'A.1 - Isolamento Termico',
        incentivoTeorico: incentivoTeorico,
        incentivoFinale: incentivoFinale,
        vincoloApplicato: vincoloApplicato,
        durataAnni: 2, // Per semplificare, assumo sempre 2 anni
        rataAnnuale: incentivoFinale / 2,
        dettagli: {
            'Zona Climatica': zonaClimatica,
            'Superficie': superficie.toFixed(2) + ' m²',
            'Costo specifico': costoSpecifico.toFixed(2) + ' €/m²',
            'Spesa totale': spesaTotale.toFixed(2) + ' €',
            '% spesa applicata': (percSpesa * 100).toFixed(0) + '%',
            'Limite 65%': limite65.toFixed(2) + ' €'
        }
    };
}

// Calcolo A.2 - Sostituzione Chiusure Trasparenti
function calcolaA2() {
    const zonaClimatica = document.getElementById('zonaClimatica').value;
    const superficie = parseFloat(document.getElementById('superficie').value);
    const costoSpecifico = parseFloat(document.getElementById('costoSpecifico').value);
    const spesaTotale = parseFloat(document.getElementById('spesaTotale').value);
    const prodottoUE = document.getElementById('prodottoUE').checked;

    // Costi massimi ammissibili
    const Cmax = ['A', 'B', 'C'].includes(zonaClimatica) ? 700 : 800;

    // Costo da utilizzare (minimo tra sostenuto e massimo)
    const costoAmmissibile = Math.min(costoSpecifico, Cmax);

    // % spesa base
    let percSpesa = 0.40;
    if (prodottoUE) {
        percSpesa += 0.10;
    }

    // Calcolo incentivo teorico
    const incentivoTeorico = percSpesa * costoAmmissibile * superficie;

    // Applicazione vincoli
    const Imax = 500000; // €
    const limite65 = spesaTotale * 0.65;

    const incentivoFinale = Math.min(incentivoTeorico, Imax, limite65);

    const vincoloApplicato =
        incentivoFinale === Imax ? 'Imax (500.000 €)' :
        incentivoFinale === limite65 ? '65% spesa sostenuta' :
        costoSpecifico > Cmax ? 'Costo massimo ammissibile' :
        'Nessun vincolo';

    return {
        tipo: 'A.2 - Sostituzione Chiusure Trasparenti',
        incentivoTeorico: incentivoTeorico,
        incentivoFinale: incentivoFinale,
        vincoloApplicato: vincoloApplicato,
        durataAnni: 2,
        rataAnnuale: incentivoFinale / 2,
        dettagli: {
            'Zona Climatica': zonaClimatica,
            'Superficie': superficie.toFixed(2) + ' m²',
            'Costo specifico sostenuto': costoSpecifico.toFixed(2) + ' €/m²',
            'Costo massimo ammissibile': Cmax.toFixed(2) + ' €/m²',
            'Costo utilizzato': costoAmmissibile.toFixed(2) + ' €/m²',
            'Spesa totale': spesaTotale.toFixed(2) + ' €',
            '% spesa applicata': (percSpesa * 100).toFixed(0) + '%',
            'Limite 65%': limite65.toFixed(2) + ' €'
        }
    };
}

// Calcolo A.3 - Trasformazione NZEB
function calcolaA3() {
    const zonaClimatica = document.getElementById('zonaClimatica').value;
    const superficie = parseFloat(document.getElementById('superficieEdificio').value);
    const costoSpecifico = parseFloat(document.getElementById('costoSpecifico').value);
    const spesaTotale = parseFloat(document.getElementById('spesaTotale').value);
    const prodottoUE = document.getElementById('prodottoUE').checked;

    // Costi massimi ammissibili
    const Cmax = ['A', 'B', 'C'].includes(zonaClimatica) ? 1000 : 1300;

    // Costo da utilizzare
    const costoAmmissibile = Math.min(costoSpecifico, Cmax);

    // % spesa base
    let percSpesa = 0.65;
    if (prodottoUE) {
        percSpesa += 0.10;
    }

    // Calcolo incentivo teorico
    const incentivoTeorico = percSpesa * costoAmmissibile * superficie;

    // Applicazione vincoli
    const Imax = ['A', 'B', 'C'].includes(zonaClimatica) ? 2500000 : 3000000;
    const limite65 = spesaTotale * 0.65;

    const incentivoFinale = Math.min(incentivoTeorico, Imax, limite65);

    const vincoloApplicato =
        incentivoFinale === Imax ? `Imax (${Imax.toLocaleString('it-IT')} €)` :
        incentivoFinale === limite65 ? '65% spesa sostenuta' :
        costoSpecifico > Cmax ? 'Costo massimo ammissibile' :
        'Nessun vincolo';

    return {
        tipo: 'A.3 - Trasformazione NZEB',
        incentivoTeorico: incentivoTeorico,
        incentivoFinale: incentivoFinale,
        vincoloApplicato: vincoloApplicato,
        durataAnni: 5,
        rataAnnuale: incentivoFinale / 5,
        dettagli: {
            'Zona Climatica': zonaClimatica,
            'Superficie edificio': superficie.toFixed(2) + ' m²',
            'Costo specifico sostenuto': costoSpecifico.toFixed(2) + ' €/m²',
            'Costo massimo ammissibile': Cmax.toFixed(2) + ' €/m²',
            'Costo utilizzato': costoAmmissibile.toFixed(2) + ' €/m²',
            'Spesa totale': spesaTotale.toFixed(2) + ' €',
            '% spesa applicata': (percSpesa * 100).toFixed(0) + '%',
            'Limite 65%': limite65.toFixed(2) + ' €'
        }
    };
}

// Calcolo A.4 - Building Automation
function calcolaA4() {
    const superficie = parseFloat(document.getElementById('superficieEdificio').value);
    const costoSpecifico = parseFloat(document.getElementById('costoSpecifico').value);
    const spesaTotale = parseFloat(document.getElementById('spesaTotale').value);
    const prodottoUE = document.getElementById('prodottoUE').checked;

    // Costo massimo ammissibile
    const Cmax = 60; // €/m²

    // Costo da utilizzare
    const costoAmmissibile = Math.min(costoSpecifico, Cmax);

    // % spesa base
    let percSpesa = 0.40;
    if (prodottoUE) {
        percSpesa += 0.10;
    }

    // Calcolo incentivo teorico
    const incentivoTeorico = percSpesa * costoAmmissibile * superficie;

    // Applicazione vincoli
    const Imax = 100000; // €
    const limite65 = spesaTotale * 0.65;

    const incentivoFinale = Math.min(incentivoTeorico, Imax, limite65);

    const vincoloApplicato =
        incentivoFinale === Imax ? 'Imax (100.000 €)' :
        incentivoFinale === limite65 ? '65% spesa sostenuta' :
        costoSpecifico > Cmax ? 'Costo massimo ammissibile' :
        'Nessun vincolo';

    return {
        tipo: 'A.4 - Building Automation',
        incentivoTeorico: incentivoTeorico,
        incentivoFinale: incentivoFinale,
        vincoloApplicato: vincoloApplicato,
        durataAnni: 2,
        rataAnnuale: incentivoFinale / 2,
        dettagli: {
            'Superficie edificio': superficie.toFixed(2) + ' m²',
            'Costo specifico sostenuto': costoSpecifico.toFixed(2) + ' €/m²',
            'Costo massimo ammissibile': Cmax.toFixed(2) + ' €/m²',
            'Costo utilizzato': costoAmmissibile.toFixed(2) + ' €/m²',
            'Spesa totale': spesaTotale.toFixed(2) + ' €',
            '% spesa applicata': (percSpesa * 100).toFixed(0) + '%',
            'Limite 65%': limite65.toFixed(2) + ' €'
        }
    };
}

// Calcolo A.5 - Fotovoltaico e Accumulo
function calcolaA5() {
    const potenzaFV = parseFloat(document.getElementById('potenzaFV').value);
    const spesaFV = parseFloat(document.getElementById('spesaFV').value);
    const capacitaAccumulo = parseFloat(document.getElementById('capacitaAccumulo').value) || 0;
    const spesaAccumulo = parseFloat(document.getElementById('spesaAccumulo').value) || 0;
    const incentivoPC = parseFloat(document.getElementById('incentivoPC').value);

    // Costo massimo ammissibile FV (semplificato: uso 1.500 €/kW fino a 20 kW)
    let CmaxFV;
    if (potenzaFV <= 20) {
        CmaxFV = 1500;
    } else if (potenzaFV <= 200) {
        CmaxFV = 1100;
    } else {
        CmaxFV = 800;
    }

    const costoAmmissibileFV = Math.min(spesaFV / potenzaFV, CmaxFV) * potenzaFV;

    // Costo massimo ammissibile Accumulo
    const CmaxAccumulo = 1000; // €/kWh
    const costoAmmissibileAccumulo = capacitaAccumulo > 0 ?
        Math.min(spesaAccumulo / capacitaAccumulo, CmaxAccumulo) * capacitaAccumulo : 0;

    // Calcolo incentivi
    const incentivoFV = 0.20 * costoAmmissibileFV;
    const incentivoAccumulo = 0.20 * costoAmmissibileAccumulo;
    const incentivoTeorico = incentivoFV + incentivoAccumulo;

    // Vincolo: non può superare l'incentivo della pompa di calore abbinata
    const incentivoFinale = Math.min(incentivoTeorico, incentivoPC);

    const vincoloApplicato =
        incentivoFinale === incentivoPC ? 'Incentivo pompa di calore abbinata' :
        'Nessun vincolo';

    return {
        tipo: 'A.5 - Fotovoltaico e Accumulo',
        incentivoTeorico: incentivoTeorico,
        incentivoFinale: incentivoFinale,
        vincoloApplicato: vincoloApplicato,
        durataAnni: 2,
        rataAnnuale: incentivoFinale / 2,
        dettagli: {
            'Potenza FV': potenzaFV.toFixed(2) + ' kW',
            'Spesa FV': spesaFV.toFixed(2) + ' €',
            'Costo max FV': CmaxFV.toFixed(2) + ' €/kW',
            'Incentivo FV': incentivoFV.toFixed(2) + ' €',
            'Capacità Accumulo': capacitaAccumulo.toFixed(2) + ' kWh',
            'Spesa Accumulo': spesaAccumulo.toFixed(2) + ' €',
            'Incentivo Accumulo': incentivoAccumulo.toFixed(2) + ' €',
            'Incentivo PC abbinata': incentivoPC.toFixed(2) + ' €'
        }
    };
}

// Calcolo B.1 - Pompe di Calore Elettriche
function calcolaB1() {
    const zonaClimatica = document.getElementById('zonaClimatica').value;
    const potenza = parseFloat(document.getElementById('potenza').value);
    const scop = parseFloat(document.getElementById('scop').value);
    const spesaTotale = parseFloat(document.getElementById('spesaTotale').value);

    // Durata incentivo
    const durataAnni = potenza <= 35 ? 2 : 5;

    // Coefficiente di valorizzazione e utilizzo
    const Ci = COEFF_VALORIZZAZIONE[zonaClimatica];
    const Quf = COEFF_UTILIZZO[zonaClimatica];

    // Energia termica incentivata annuale (formula semplificata)
    // Ei = Potenza * ore * Quf * (1 - 1/SCOP)
    // Per semplicità uso: Ei = Potenza * 2000 ore * Quf * (SCOP - 1) / SCOP
    const Ei = potenza * 2000 * Quf * ((scop - 1) / scop);

    // Incentivo totale
    const incentivoTeorico = durataAnni * Ei * Ci;

    // Applicazione vincoli
    const limite65 = spesaTotale * 0.65;

    const incentivoFinale = Math.min(incentivoTeorico, limite65);

    const vincoloApplicato =
        incentivoFinale === limite65 ? '65% spesa sostenuta' :
        'Nessun vincolo';

    return {
        tipo: 'B.1 - Pompe di Calore Elettriche',
        incentivoTeorico: incentivoTeorico,
        incentivoFinale: incentivoFinale,
        vincoloApplicato: vincoloApplicato,
        durataAnni: durataAnni,
        rataAnnuale: incentivoFinale / durataAnni,
        dettagli: {
            'Zona Climatica': zonaClimatica,
            'Potenza': potenza.toFixed(2) + ' kW',
            'SCOP': scop.toFixed(2),
            'Energia incentivata (Ei)': Ei.toFixed(2) + ' kWht/anno',
            'Coeff. valorizzazione (Ci)': Ci.toFixed(3) + ' €/kWht',
            'Spesa totale': spesaTotale.toFixed(2) + ' €',
            'Limite 65%': limite65.toFixed(2) + ' €',
            'Durata': durataAnni + ' anni'
        }
    };
}

// Calcolo B.2 - Sistemi Ibridi/Bivalenti
function calcolaB2() {
    const tipoSistema = document.getElementById('tipoSistema').value;
    const zonaClimatica = document.getElementById('zonaClimatica').value;
    const potenza = parseFloat(document.getElementById('potenza').value);
    const scop = parseFloat(document.getElementById('scop').value);
    const spesaTotale = parseFloat(document.getElementById('spesaTotale').value);

    // Coefficiente k
    let k;
    switch (tipoSistema) {
        case 'ibrido-fm':
            k = 1.25;
            break;
        case 'bivalente-35':
            k = 1.0;
            break;
        case 'bivalente-35p':
            k = 1.1;
            break;
    }

    // Durata incentivo
    const durataAnni = potenza <= 35 ? 2 : 5;

    // Coefficiente di valorizzazione e utilizzo
    const Ci = COEFF_VALORIZZAZIONE[zonaClimatica];
    const Quf = COEFF_UTILIZZO[zonaClimatica];

    // Energia termica incentivata annuale
    const Ei = potenza * 2000 * Quf * ((scop - 1) / scop);

    // Incentivo totale con coefficiente k
    const incentivoTeorico = durataAnni * k * Ei * Ci;

    // Applicazione vincoli
    const limite65 = spesaTotale * 0.65;

    const incentivoFinale = Math.min(incentivoTeorico, limite65);

    const vincoloApplicato =
        incentivoFinale === limite65 ? '65% spesa sostenuta' :
        'Nessun vincolo';

    return {
        tipo: 'B.2 - Sistemi Ibridi/Bivalenti',
        incentivoTeorico: incentivoTeorico,
        incentivoFinale: incentivoFinale,
        vincoloApplicato: vincoloApplicato,
        durataAnni: durataAnni,
        rataAnnuale: incentivoFinale / durataAnni,
        dettagli: {
            'Tipo Sistema': tipoSistema,
            'Coefficiente k': k.toFixed(2),
            'Zona Climatica': zonaClimatica,
            'Potenza PC': potenza.toFixed(2) + ' kW',
            'SCOP': scop.toFixed(2),
            'Energia incentivata (Ei)': Ei.toFixed(2) + ' kWht/anno',
            'Coeff. valorizzazione (Ci)': Ci.toFixed(3) + ' €/kWht',
            'Spesa totale': spesaTotale.toFixed(2) + ' €',
            'Limite 65%': limite65.toFixed(2) + ' €',
            'Durata': durataAnni + ' anni'
        }
    };
}

// Calcolo B.3 - Scaldacqua a Pompa di Calore
function calcolaB3() {
    const classeEnergetica = document.getElementById('classeEnergetica').value;
    const capacita = parseFloat(document.getElementById('capacita').value);
    const spesaTotale = parseFloat(document.getElementById('spesaTotale').value);

    // Massimali in base a classe e capacità
    let Imax;
    if (classeEnergetica === 'A') {
        Imax = capacita <= 150 ? 500 : 1100;
    } else { // A+
        Imax = capacita <= 150 ? 700 : 1500;
    }

    // Calcolo incentivo
    const incentivoTeorico = 0.40 * spesaTotale;

    // Applicazione vincoli
    const incentivoFinale = Math.min(incentivoTeorico, Imax);

    const vincoloApplicato =
        incentivoFinale === Imax ? `Imax (${Imax} €)` :
        'Nessun vincolo';

    // Verifica se incentivo < 15000 € (erogazione in unica rata per privati)
    const erogazione = incentivoFinale <= 15000 ?
        'Unica rata (per soggetti privati)' :
        '2 rate annuali';

    return {
        tipo: 'B.3 - Scaldacqua a Pompa di Calore',
        incentivoTeorico: incentivoTeorico,
        incentivoFinale: incentivoFinale,
        vincoloApplicato: vincoloApplicato,
        durataAnni: 2,
        rataAnnuale: incentivoFinale / 2,
        erogazione: erogazione,
        dettagli: {
            'Classe Energetica': classeEnergetica,
            'Capacità': capacita + ' litri',
            'Spesa totale': spesaTotale.toFixed(2) + ' €',
            'Massimale (Imax)': Imax + ' €',
            'Modalità erogazione': erogazione
        }
    };
}

// Calcolo B.4 - Allaccio a Teleriscaldamento
function calcolaB4() {
    const potenza = parseFloat(document.getElementById('potenza').value);
    const costoSpecifico = parseFloat(document.getElementById('costoSpecifico').value);
    const spesaTotale = parseFloat(document.getElementById('spesaTotale').value);

    // Massimale in base alla potenza
    let Imax;
    if (potenza <= 50) {
        Imax = 6500;
    } else if (potenza <= 150) {
        Imax = 15000;
    } else {
        Imax = 30000;
    }

    // Calcolo incentivo
    const incentivoTeorico = 0.65 * costoSpecifico * potenza;

    // Applicazione vincoli
    const limite65 = spesaTotale * 0.65;
    const incentivoFinale = Math.min(incentivoTeorico, Imax, limite65);

    const vincoloApplicato =
        incentivoFinale === Imax ? `Imax (${Imax.toLocaleString('it-IT')} €)` :
        incentivoFinale === limite65 ? '65% spesa sostenuta' :
        'Nessun vincolo';

    return {
        tipo: 'B.4 - Allaccio a Teleriscaldamento',
        incentivoTeorico: incentivoTeorico,
        incentivoFinale: incentivoFinale,
        vincoloApplicato: vincoloApplicato,
        durataAnni: 5,
        rataAnnuale: incentivoFinale / 5,
        dettagli: {
            'Potenza sottostazione': potenza.toFixed(2) + ' kW',
            'Costo specifico': costoSpecifico.toFixed(2) + ' €/kW',
            'Spesa totale': spesaTotale.toFixed(2) + ' €',
            'Massimale (Imax)': Imax.toLocaleString('it-IT') + ' €',
            'Limite 65%': limite65.toFixed(2) + ' €',
            'Durata': '5 anni'
        }
    };
}

// Funzione per mostrare i risultati
function mostraRisultati(risultato) {
    const resultsSection = document.getElementById('results');
    const risultatiDettaglio = document.getElementById('risultati-dettaglio');

    let html = `
        <div class="result-highlight">
            <h3>Incentivo Erogabile</h3>
            <div class="amount">${risultato.incentivoFinale.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €</div>
        </div>

        <div class="details-box">
            <h4>${risultato.tipo}</h4>
            <div class="result-item">
                <span class="result-label">Incentivo teorico:</span>
                <span class="result-value">${risultato.incentivoTeorico.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €</span>
            </div>
            <div class="result-item">
                <span class="result-label">Incentivo finale:</span>
                <span class="result-value">${risultato.incentivoFinale.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €</span>
            </div>
            <div class="result-item">
                <span class="result-label">Vincolo applicato:</span>
                <span class="result-value">${risultato.vincoloApplicato}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Durata incentivo:</span>
                <span class="result-value">${risultato.durataAnni} anni</span>
            </div>
            <div class="result-item">
                <span class="result-label">Rata annuale:</span>
                <span class="result-value">${risultato.rataAnnuale.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €</span>
            </div>
    `;

    if (risultato.erogazione) {
        html += `
            <div class="result-item">
                <span class="result-label">Modalità erogazione:</span>
                <span class="result-value">${risultato.erogazione}</span>
            </div>
        `;
    }

    html += `
        </div>

        <div class="details-box">
            <h4>Dettagli Calcolo</h4>
    `;

    for (const [chiave, valore] of Object.entries(risultato.dettagli)) {
        html += `
            <div class="result-item">
                <span class="result-label">${chiave}:</span>
                <span class="result-value">${valore}</span>
            </div>
        `;
    }

    html += `</div>`;

    // Aggiungi note informative
    if (risultato.incentivoFinale <= 15000) {
        html += `
            <div class="info">
                Per soggetti privati, l'incentivo può essere erogato in unica rata (importo ≤ 15.000 €).
            </div>
        `;
    }

    risultatiDettaglio.innerHTML = html;
    resultsSection.style.display = 'block';

    // Scroll ai risultati
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
