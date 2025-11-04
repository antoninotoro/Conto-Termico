// Costanti e parametri del Conto Termico 3.0

const ZONE_CLIMATICHE = ['A', 'B', 'C', 'D', 'E', 'F'];

// Valori massimi di trasmittanza termica U (W/m²K) per zona climatica - Tabella 2 Allegato I
const TRASMITTANZA_MAX = {
    'coperture': { 'A': 0.43, 'B': 0.38, 'C': 0.34, 'D': 0.29, 'E': 0.26, 'F': 0.24 },
    'pavimenti': { 'A': 0.60, 'B': 0.46, 'C': 0.40, 'D': 0.34, 'E': 0.30, 'F': 0.27 },
    'pareti': { 'A': 0.45, 'B': 0.40, 'C': 0.36, 'D': 0.32, 'E': 0.28, 'F': 0.26 },
    'finestre': { 'A': 3.0, 'B': 2.4, 'C': 2.1, 'D': 2.0, 'E': 1.8, 'F': 1.6 }
};

// Coefficienti di valorizzazione Ci per zona climatica (€/kWht)
const COEFF_VALORIZZAZIONE = {
    'A': 0.055,
    'B': 0.065,
    'C': 0.075,
    'D': 0.085,
    'E': 0.095,
    'F': 0.105
};

// Coefficienti di utilizzo Quf per zona climatica
const COEFF_UTILIZZO = {
    'A': 0.3,
    'B': 0.4,
    'C': 0.5,
    'D': 0.6,
    'E': 0.7,
    'F': 0.8
};

// Efficienza minima pompe di calore (SCOP/ηs) - valori Ecodesign zona "average"
const EFFICIENZA_MIN_PDC = {
    'aria-acqua_BT': { scop: 3.5, eta_s: 125 },  // Bassa temperatura
    'aria-acqua_MT': { scop: 3.1, eta_s: 111 },  // Media temperatura
    'acqua-acqua': { scop: 4.5, eta_s: 160 },
    'gas': { sper: 1.26, eta_s: 126 }
};

// Variabili globali
let interventoSelezionato = null;
let datiIntervento = {};
let currentTooltip = null;

// Helper per creare etichetta con icona info
function labelWithInfo(text, infoText) {
    const id = 'info-' + Math.random().toString(36).substr(2, 9);
    return `
        <div class="label-with-info">
            <span>${text}</span>
            <span class="info-icon" onclick="showTooltip(event, '${id}')" title="Clicca per maggiori informazioni">ℹ</span>
        </div>
        <div id="${id}" class="info-tooltip-data" style="display:none;">${infoText}</div>
    `;
}

// Funzione per mostrare tooltip
function showTooltip(event, dataId) {
    event.stopPropagation();

    // Chiudi tooltip precedente se esiste
    if (currentTooltip) {
        currentTooltip.remove();
        currentTooltip = null;
    }

    // Ottieni il contenuto del tooltip
    const dataElement = document.getElementById(dataId);
    if (!dataElement) return;

    const content = dataElement.textContent;

    // Crea il tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'info-tooltip show';
    tooltip.innerHTML = `
        <button class="info-tooltip-close" onclick="closeTooltip(event)">×</button>
        <div class="info-tooltip-content">${content}</div>
    `;

    document.body.appendChild(tooltip);
    currentTooltip = tooltip;

    // Posiziona il tooltip vicino al click
    const rect = event.target.getBoundingClientRect();
    let top = rect.bottom + 10;
    let left = rect.left;

    // Assicurati che il tooltip non esca dallo schermo
    setTimeout(() => {
        const tooltipRect = tooltip.getBoundingClientRect();

        // Aggiusta posizione orizzontale
        if (left + tooltipRect.width > window.innerWidth - 20) {
            left = window.innerWidth - tooltipRect.width - 20;
        }
        if (left < 20) {
            left = 20;
        }

        // Aggiusta posizione verticale
        if (top + tooltipRect.height > window.innerHeight - 20) {
            top = rect.top - tooltipRect.height - 10;
        }

        tooltip.style.top = top + 'px';
        tooltip.style.left = left + 'px';
    }, 10);
}

// Funzione per chiudere tooltip
function closeTooltip(event) {
    if (event) event.stopPropagation();
    if (currentTooltip) {
        currentTooltip.remove();
        currentTooltip = null;
    }
}

// Chiudi tooltip quando si clicca fuori
document.addEventListener('click', function() {
    closeTooltip();
});

// Funzione per mostrare campi condizionali in base al soggetto richiedente
function mostraCampiSoggetto() {
    const select = document.getElementById('soggetto-richiedente');
    const soggetto = select.value;
    const container = document.getElementById('campi-soggetto-container');

    if (!soggetto) {
        container.innerHTML = '';
        return;
    }

    let campiHTML = '';

    // Campi per imprese
    if (soggetto.startsWith('impresa_')) {
        campiHTML += `
            <div class="form-row">
                <div class="form-group">
                    <label>${labelWithInfo('Dimensione Impresa', '<b>Piccola impresa:</b> <250 dipendenti, fatturato ≤50M€ o bilancio ≤43M€. <b>Media impresa:</b> <250 dipendenti, fatturato ≤50M€ o bilancio ≤43M€ ma non piccola. <b>Grande impresa:</b> oltre tali limiti. La dimensione influenza le maggiorazioni dell\'incentivo.')}</label>
                    <select id="dimensione-impresa">
                        <option value="grande">Grande Impresa</option>
                        <option value="media">Media Impresa (+10%)</option>
                        <option value="piccola">Piccola Impresa (+20%)</option>
                    </select>
                </div>
            </div>
        `;

        if (soggetto === 'impresa_efficienza') {
            campiHTML += `
                <div class="form-row">
                    <div class="form-group">
                        <label>${labelWithInfo('Zona Assistita', 'Zone geografiche con particolare necessità di sviluppo economico (ex Obiettivo Convergenza UE). Prevalentemente Sud Italia e aree specifiche. Se l\'intervento è realizzato in zona assistita, l\'incentivo aumenta del +15%. Verifica su Carta degli Aiuti di Stato.')}</label>
                        <select id="zona-assistita">
                            <option value="no">No</option>
                            <option value="si">Sì - Zona Assistita (+15%)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>${labelWithInfo('Miglioramento Prestazione ≥40%', 'Se l\'intervento di efficienza energetica determina un miglioramento della prestazione energetica dell\'edificio di almeno il 40% (rispetto allo stato ante operam), l\'incentivo aumenta del +15%. Si dimostra tramite APE ante e post intervento.')}</label>
                        <select id="miglioramento-40">
                            <option value="no">No</option>
                            <option value="si">Sì - Miglioramento ≥40% (+15%)</option>
                        </select>
                    </div>
                </div>
            `;
        }
    }

    // Campi per comuni piccoli
    if (soggetto === 'comune_piccolo') {
        campiHTML += `
            <div class="info" style="margin-top: 15px;">
                <strong>Requisiti:</strong> Il Comune deve avere popolazione ≤15.000 abitanti e l'intervento deve essere realizzato su edifici di proprietà del comune e da esso utilizzati. L'incentivo copre il 100% delle spese ammissibili.
            </div>
        `;
    }

    // Campi per edifici pubblici Art. 48-ter
    if (soggetto === 'edificio_pubblico') {
        campiHTML += `
            <div class="info" style="margin-top: 15px;">
                <strong>Edifici previsti all'Art. 48-ter D.L. 104/2020:</strong> L'incentivo copre il 100% delle spese ammissibili per interventi su edifici pubblici appartenenti a qualunque categoria catastale, previsti dalla normativa specifica.
            </div>
        `;
    }

    container.innerHTML = campiHTML;
}

// Funzione per mostrare il form appropriato
function mostraFormIntervento() {
    const select = document.getElementById('intervento-tipo');
    interventoSelezionato = select.value;
    const container = document.getElementById('form-container');
    const calcBtn = document.getElementById('calcola-btn');
    const results = document.getElementById('results');

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
        case 'A6':
            formHTML = getFormA6();
            break;
        case 'A7':
            formHTML = getFormA7();
            break;
        case 'A8':
            formHTML = getFormA8();
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
        case 'B5':
            formHTML = getFormB5();
            break;
        case 'B6':
            formHTML = getFormB6();
            break;
        case 'B7':
            formHTML = getFormB7();
            break;
    }

    container.innerHTML = formHTML;
    calcBtn.style.display = 'block';
}

// Helper: Form Pompa di Calore per multi-intervento (con prefisso ID personalizzato)
function getFormPompaDiCaloreAbbinata(mostraDefault = false) {
    const displayStyle = mostraDefault ? 'block' : 'none';
    return `
        <div id="pdc-section" style="display:${displayStyle}; margin-top: 30px; padding: 20px; background: #E8F4F3; border-radius: 8px; border-left: 4px solid #00A19C;">
            <h3 style="color: #00A19C;">Pompa di Calore Abbinata (Art. 8 - B.1)</h3>

            <div class="info">
                Compila i dati della pompa di calore per calcolare l'incentivo complessivo del multi-intervento.
            </div>

            <div class="form-group">
                ${labelWithInfo('Tipologia Pompa di Calore', 'Tipo di pompa di calore: Aria-Acqua BT (bassa temperatura, riscaldamento a pavimento), Aria-Acqua MT (media temperatura, radiatori), Acqua-Acqua (geotermica), o Pompa a Gas (assorbimento).')}
                <select id="pdc_tipoPDC">
                    <option value="aria-acqua_BT">Aria-Acqua Bassa Temperatura</option>
                    <option value="aria-acqua_MT">Aria-Acqua Media Temperatura</option>
                    <option value="acqua-acqua">Acqua-Acqua</option>
                    <option value="gas">Pompa a Gas</option>
                </select>
            </div>

            <div class="form-row">
                <div class="form-group">
                    ${labelWithInfo('Potenza nominale (kW)', 'Potenza termica nominale della pompa di calore in condizioni standard. Si trova nella scheda tecnica del prodotto.')}
                    <input type="number" id="pdc_potenza" min="0" step="0.01">
                </div>
                <div class="form-group">
                    <label id="pdc_labelSCOP">SCOP (Coefficiente Prestazione Stagionale):</label>
                    <input type="number" id="pdc_scop" min="0" step="0.01">
                    <small id="pdc_scop-info" class="info-text"></small>
                </div>
            </div>

            <div class="form-group">
                ${labelWithInfo('Efficienza energetica riscaldamento stagionale ηs (%)', 'Efficienza stagionale espressa in percentuale. Indica quanta energia elettrica consumata viene convertita in calore. Deve rispettare i requisiti Ecodesign.')}
                <input type="number" id="pdc_eta_s" min="0" step="1">
                <small id="pdc_eta-info" class="info-text"></small>
            </div>

            <div class="form-group">
                ${labelWithInfo('Spesa totale pompa di calore (€)', 'Costo complessivo di acquisto e installazione della pompa di calore, IVA inclusa. Usato per calcolare il vincolo del 65% della spesa.')}
                <input type="number" id="pdc_spesaTotale" min="0" step="0.01">
            </div>

            <div class="checkbox-group">
                <input type="checkbox" id="pdc_sostituzioneImpianto">
                <label for="pdc_sostituzioneImpianto">Sostituzione di impianto esistente (obbligatorio per B.1)</label>
            </div>
        </div>

        <script>
            if (document.getElementById('pdc_tipoPDC')) {
                document.getElementById('pdc_tipoPDC').addEventListener('change', updatePDCEfficienzaInfo);
                updatePDCEfficienzaInfo();
            }

            function updatePDCEfficienzaInfo() {
                const tipo = document.getElementById('pdc_tipoPDC').value;
                const req = EFFICIENZA_MIN_PDC[tipo];
                if (tipo === 'gas') {
                    document.getElementById('pdc_labelSCOP').textContent = 'SPER (Seasonal Primary Energy Ratio):';
                    document.getElementById('pdc_scop-info').innerHTML =
                        '<span style="color: #006B68;">Valore minimo: ' + req.sper + '</span>';
                } else {
                    document.getElementById('pdc_labelSCOP').textContent = 'SCOP (Coefficiente Prestazione Stagionale):';
                    document.getElementById('pdc_scop-info').innerHTML =
                        '<span style="color: #006B68;">Valore minimo: ' + req.scop + '</span>';
                }
                document.getElementById('pdc_eta-info').innerHTML =
                    '<span style="color: #006B68;">Valore minimo: ' + req.eta_s + '%</span>';
            }
        </script>
    `;
}

// Form A.1 - Isolamento Termico
function getFormA1() {
    return `
        <h3>A.1 - Isolamento Termico (Superfici opache)</h3>

        <div class="warning">
            <strong>Requisiti Obbligatori:</strong> Intervento su strutture opache esistenti.
            Necessaria Diagnosi Energetica preventiva e APE post-intervento.
        </div>

        <div class="form-group">
            ${labelWithInfo('Tipo di Struttura', 'Seleziona il tipo di elemento edilizio su cui viene eseguito l\'isolamento: coperture (tetti), pavimenti o pareti verticali esterne.')}
            <select id="tipoStruttura">
                <option value="coperture">Coperture</option>
                <option value="pavimenti">Pavimenti</option>
                <option value="pareti">Pareti verticali</option>
            </select>
        </div>

        <div class="form-group">
            ${labelWithInfo('Zona Climatica', 'Zona climatica del comune dove si trova l\'edificio (da A=caldo a F=freddo). Determina i limiti massimi di trasmittanza e i coefficienti di calcolo.')}
            <select id="zonaClimatica">
                ${ZONE_CLIMATICHE.map(z => `<option value="${z}">${z}</option>`).join('')}
            </select>
        </div>

        <div class="form-row">
            <div class="form-group">
                ${labelWithInfo('Trasmittanza U post-intervento (W/m²K)', 'Trasmittanza termica della struttura DOPO l\'intervento. Indica quanto calore passa attraverso la struttura. Valori più bassi = miglior isolamento. Deve rispettare i limiti di zona.')}
                <input type="number" id="trasmittanza" min="0" step="0.01" required>
                <small id="trasmittanza-info" class="info-text"></small>
            </div>
            <div class="form-group">
                ${labelWithInfo('Superficie oggetto intervento (m²)', 'Superficie totale in metri quadrati su cui viene eseguito l\'intervento di isolamento termico.')}
                <input type="number" id="superficie" min="0" step="0.01" required>
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                ${labelWithInfo('Costo specifico sostenuto (€/m²)', 'Costo dell\'intervento diviso per la superficie. Esempio: se spendi 10.000€ per 50m², il costo specifico è 200€/m².')}
                <input type="number" id="costoSpecifico" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                ${labelWithInfo('Spesa totale sostenuta (€)', 'Costo complessivo dell\'intervento, comprensivo di materiali, manodopera e IVA. Usato per calcolare il limite del 65% e verificare Imax.')}
                <input type="number" id="spesaTotale" min="0" step="0.01" required>
            </div>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="isolamentoInterno">
            <label for="isolamentoInterno">Isolamento interno o in intercapedine (trasmittanza +30%)</label>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="multiIntervento">
            <label for="multiIntervento">Multi-intervento con Art. 8 - Pompa di Calore (maggiorazione 55%)</label>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="prodottoUE">
            <label for="prodottoUE">Componenti prodotti in UE (+10%)</label>
        </div>

        ${getFormPompaDiCaloreAbbinata()}

        <script>
            document.getElementById('zonaClimatica').addEventListener('change', updateTrasmittanzaInfo);
            document.getElementById('tipoStruttura').addEventListener('change', updateTrasmittanzaInfo);
            document.getElementById('isolamentoInterno').addEventListener('change', updateTrasmittanzaInfo);
            document.getElementById('multiIntervento').addEventListener('change', togglePDCSection);
            updateTrasmittanzaInfo();

            function updateTrasmittanzaInfo() {
                const zona = document.getElementById('zonaClimatica').value;
                const tipo = document.getElementById('tipoStruttura').value;
                const interno = document.getElementById('isolamentoInterno').checked;
                let uMax = TRASMITTANZA_MAX[tipo][zona];
                if (interno) uMax = (uMax * 1.3).toFixed(3);
                document.getElementById('trasmittanza-info').innerHTML =
                    '<span style="color: #006B68;">Valore massimo ammesso: ' + uMax + ' W/m²K</span>';
            }

            function togglePDCSection() {
                const multiIntervento = document.getElementById('multiIntervento').checked;
                const pdcSection = document.getElementById('pdc-section');
                if (multiIntervento) {
                    pdcSection.style.display = 'block';
                } else {
                    pdcSection.style.display = 'none';
                }
            }
        </script>
    `;
}

// Form A.2 - Sostituzione Chiusure Trasparenti
function getFormA2() {
    return `
        <h3>A.2 - Sostituzione Chiusure Trasparenti (Infissi)</h3>

        <div class="warning">
            <strong>Condizione Obbligatoria:</strong> Incentivato solo se installato congiuntamente a sistemi di
            termoregolazione/valvole termostatiche, o in loro presenza.
        </div>

        <div class="info">
            Necessaria Diagnosi Energetica e APE per impianti ≥200 kW.
        </div>

        <div class="form-group">
            ${labelWithInfo('Zona Climatica', 'Zona climatica del comune dove si trova l\'edificio (da A=caldo a F=freddo). Determina i limiti massimi di trasmittanza ammessi per le finestre.')}
            <select id="zonaClimatica">
                ${ZONE_CLIMATICHE.map(z => `<option value="${z}">${z}</option>`).join('')}
            </select>
        </div>

        <div class="form-row">
            <div class="form-group">
                ${labelWithInfo('Trasmittanza U finestre (W/m²K)', 'Trasmittanza termica dell\'intero serramento (telaio + vetro) DOPO la sostituzione. Misura l\'isolamento: valori più bassi = minor dispersione di calore. Deve rispettare i limiti per zona climatica.')}
                <input type="number" id="trasmittanza" min="0" step="0.01" required>
                <small id="trasmittanza-info" class="info-text"></small>
            </div>
            <div class="form-group">
                ${labelWithInfo('Superficie oggetto intervento (m²)', 'Superficie totale delle finestre/porte-finestre da sostituire. Si calcola: larghezza × altezza di ogni serramento, poi si sommano tutti.')}
                <input type="number" id="superficie" min="0" step="0.01" required>
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                ${labelWithInfo('Costo specifico sostenuto (€/m²)', 'Costo medio per metro quadro di serramento installato. Si calcola: spesa totale ÷ superficie totale.')}
                <input type="number" id="costoSpecifico" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                ${labelWithInfo('Spesa totale sostenuta (€)', 'Costo complessivo per acquisto e posa di tutti i serramenti, IVA inclusa. Usato per il vincolo del 65%.')}
                <input type="number" id="spesaTotale" min="0" step="0.01" required>
            </div>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="termoreg" required>
            <label for="termoreg">Presenza/installazione termoregolazione o valvole termostatiche (obbligatorio)</label>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="prodottoUE">
            <label for="prodottoUE">Componenti prodotti in UE (+10%)</label>
        </div>

        <script>
            document.getElementById('zonaClimatica').addEventListener('change', updateTrasmittanzaInfoA2);
            updateTrasmittanzaInfoA2();

            function updateTrasmittanzaInfoA2() {
                const zona = document.getElementById('zonaClimatica').value;
                const uMax = TRASMITTANZA_MAX['finestre'][zona];
                document.getElementById('trasmittanza-info').innerHTML =
                    '<span style="color: #006B68;">Valore massimo ammesso: ' + uMax + ' W/m²K</span>';
            }
        </script>
    `;
}

// Form A.3 - Schermature Solari e Sistemi Filtrazione
function getFormA3() {
    return `
        <h3>A.3 - Schermature Solari e Sistemi di Filtrazione</h3>

        <div class="warning">
            <strong>Condizione Obbligatoria:</strong> Incentivato esclusivamente se abbinato all'intervento di
            sostituzione delle chiusure trasparenti (Art. 5, lett. b).
        </div>

        <div class="info">
            <strong>Requisiti Tecnici:</strong>
            <ul style="margin: 10px 0 0 20px;">
                <li>Prestazione Schermatura: Classe 3 o superiore (UNI EN 14501)</li>
                <li>Meccanismi Automatici: Basati su rilevazione radiazione solare (UNI EN 15232)</li>
                <li>Sistemi Filtrazione: Fattore solare g<sub>tot</sub> nel range classe 3 o 4</li>
            </ul>
        </div>

        <div class="form-group">
            ${labelWithInfo('Tipologia', 'Schermature Solari: tende, veneziane, frangisole esterni che bloccano il sole. Sistemi di Filtrazione: pellicole o vetri speciali che filtrano i raggi solari mantenendo la trasparenza.')}
            <select id="tipoSchermatura">
                <option value="schermatura">Schermature Solari</option>
                <option value="filtrazione">Sistemi di Filtrazione</option>
            </select>
        </div>

        <div class="form-row">
            <div class="form-group">
                ${labelWithInfo('Superficie schermata (m²)', 'Area totale delle finestre coperte dalle schermature o dai sistemi di filtrazione. Corrisponde alla superficie vetrata protetta.')}
                <input type="number" id="superficie" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                ${labelWithInfo('Costo specifico sostenuto (€/m²)', 'Costo medio per metro quadro di schermatura installata. Include sistema, motorizzazione se automatico, installazione.')}
                <input type="number" id="costoSpecifico" min="0" step="0.01" required>
            </div>
        </div>

        <div class="form-group">
            ${labelWithInfo('Spesa totale sostenuta (€)', 'Costo complessivo per tutti i sistemi di schermatura/filtrazione, IVA inclusa. Usato per calcolare il vincolo del 65%.')}
            <input type="number" id="spesaTotale" min="0" step="0.01" required>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="abbinamentoInfissi" required>
            <label for="abbinamentoInfissi">Abbinato a sostituzione chiusure trasparenti (obbligatorio)</label>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="classe3" required>
            <label for="classe3">Classe 3 o superiore (UNI EN 14501) - Obbligatorio</label>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="automatico" required>
            <label for="automatico">Meccanismi automatici con rilevazione radiazione solare - Obbligatorio</label>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="prodottoUE">
            <label for="prodottoUE">Componenti prodotti in UE (+10%)</label>
        </div>
    `;
}

// Form A.4 - Trasformazione NZEB
function getFormA4() {
    return `
        <h3>A.3 - Trasformazione in Edificio a Energia Quasi Zero (NZEB)</h3>

        <div class="warning">
            <strong>Requisiti Obbligatori:</strong>
            <ul style="margin: 10px 0 0 20px;">
                <li>Ristrutturazione edilizia (ampliamento max 25% volumetria) o demolizione/ricostruzione</li>
                <li>APE post-operam con classificazione "edificio a energia quasi zero"</li>
                <li>Rispetto requisiti D.M. 26 giugno 2015, par. 3.4</li>
                <li>Diagnosi Energetica preventiva obbligatoria</li>
            </ul>
        </div>

        <div class="form-group">
            ${labelWithInfo('Zona Climatica', 'Zona climatica del comune. Influenza i requisiti di efficienza energetica da rispettare per ottenere la certificazione NZEB.')}
            <select id="zonaClimatica">
                ${ZONE_CLIMATICHE.map(z => `<option value="${z}">${z}</option>`).join('')}
            </select>
        </div>

        <div class="form-row">
            <div class="form-group">
                ${labelWithInfo('Superficie utile edificio (m²)', 'Superficie utile riscaldata dell\'edificio (superficie netta calpestabile, esclusi muri e vani tecnici). Si trova nell\'APE alla voce "Superficie utile".')}
                <input type="number" id="superficieEdificio" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                ${labelWithInfo('Costo specifico sostenuto (€/m²)', 'Costo dell\'intervento di ristrutturazione al metro quadro. Calcolato come: spesa totale ÷ superficie utile. Include tutti i lavori: coibentazione, impianti, serramenti.')}
                <input type="number" id="costoSpecifico" min="0" step="0.01" required>
            </div>
        </div>

        <div class="form-group">
            ${labelWithInfo('Spesa totale sostenuta (€)', 'Costo complessivo della ristrutturazione/demolizione-ricostruzione per trasformare l\'edificio in NZEB. Include tutte le opere edilizie ed impiantistiche, IVA inclusa.')}
            <input type="number" id="spesaTotale" min="0" step="0.01" required>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="certificazioneNZEB" required>
            <label for="certificazioneNZEB">APE certifica edificio come NZEB (obbligatorio)</label>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="prodottoUE">
            <label for="prodottoUE">Componenti prodotti in UE (+10%)</label>
        </div>
    `;
}

// Form A.5 - Sostituzione Sistemi Illuminazione
function getFormA5() {
    return `
        <h3>A.5 - Sostituzione di Sistemi per l'Illuminazione</h3>

        <div class="info">
            <strong>Requisiti Tecnici:</strong>
            <ul style="margin: 10px 0 0 20px;">
                <li>Indice di Resa Cromatica (CRI): >80 (interni); >60 (esterni)</li>
                <li>Efficienza Luminosa Minima: 80 lm/W</li>
                <li>Potenza Installata: Non può superare il 50% della potenza sostituita</li>
                <li>Rispetto criteri illuminotecnici (UNI EN 12464-1)</li>
            </ul>
        </div>

        <div class="form-group">
            <label>${labelWithInfo('Ambito', 'Specifica se l\'intervento riguarda l\'illuminazione <b>interna</b> agli edifici (uffici, spazi comuni) o <b>esterna</b> (aree pertinenziali come parcheggi, cortili, viali). L\'ambito determina i requisiti minimi di CRI richiesti.')}</label>
            <select id="ambitoIlluminazione">
                <option value="interno">Illuminazione Interna</option>
                <option value="esterno">Illuminazione Esterna/Pertinenze</option>
            </select>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>${labelWithInfo('Potenza precedente sostituita (kW)', 'Potenza totale del sistema di illuminazione esistente che viene sostituito. Si calcola sommando la potenza nominale di tutte le lampade e apparecchi rimossi. <b>Esempio:</b> 50 lampade fluorescenti da 40W = 2 kW.')}</label>
                <input type="number" id="potenzaPrecedente" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label>${labelWithInfo('Potenza nuova installata (kW)', 'Potenza totale del nuovo sistema LED installato. <b>Requisito obbligatorio:</b> deve essere ≤ 50% della potenza precedente per dimostrare un risparmio energetico significativo. <b>Esempio:</b> se la potenza precedente era 2 kW, la nuova deve essere ≤ 1 kW.')}</label>
                <input type="number" id="potenzaNuova" min="0" step="0.01" required>
                <small id="potenza-info" class="info-text" style="color: #006B68;">Max 50% della potenza precedente</small>
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>${labelWithInfo('Efficienza luminosa (lm/W)', 'Rapporto tra flusso luminoso emesso (lumen) e potenza assorbita (Watt). Indica quanto è efficiente la lampada LED. <b>Minimo richiesto:</b> 80 lm/W. <b>Valori tipici LED:</b> 90-150 lm/W. Si trova nella scheda tecnica del produttore.')}</label>
                <input type="number" id="efficienzaLuminosa" min="80" step="1" required>
                <small class="info-text" style="color: #006B68;">Minimo: 80 lm/W</small>
            </div>
            <div class="form-group">
                <label id="labelCRI">${labelWithInfo('CRI (Indice Resa Cromatica)', 'Misura la capacità di una sorgente luminosa di riprodurre fedelmente i colori. Scala 0-100. <b>Requisiti:</b> CRI >80 per illuminazione interna, CRI >60 per illuminazione esterna. <b>Riferimento:</b> luce naturale = 100.')}</label>
                <input type="number" id="cri" min="60" step="1" required>
                <small id="cri-info" class="info-text" style="color: #006B68;">Minimo: >80 (interni)</small>
            </div>
        </div>

        <div class="form-group">
            <label>${labelWithInfo('Spesa totale sostenuta (€)', 'Costo totale dell\'intervento comprensivo di: <b>fornitura e posa</b> delle nuove lampade LED, <b>smaltimento</b> del sistema esistente, <b>eventuale adeguamento</b> degli apparecchi. Include IVA e oneri di progettazione/direzione lavori.')}</label>
            <input type="number" id="spesaTotale" min="0" step="0.01" required>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="sostituzioneSistema" required>
            <label for="sostituzioneSistema">Sostituzione di sistema esistente (obbligatorio)</label>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="prodottoUE">
            <label for="prodottoUE">Componenti prodotti in UE (+10%)</label>
        </div>

        <script>
            document.getElementById('ambitoIlluminazione').addEventListener('change', function() {
                const ambito = this.value;
                const criMin = ambito === 'interno' ? 80 : 60;
                document.getElementById('cri').min = criMin;
                document.getElementById('cri-info').innerHTML =
                    '<span style="color: #006B68;">Minimo: >' + criMin + ' (' + ambito + ')</span>';
            });
        </script>
    `;
}

// Form A.6 - Building Automation
function getFormA6() {
    return `
        <h3>A.4 - Building Automation</h3>

        <div class="info">
            <strong>Requisito Tecnico:</strong> Il sistema deve appartenere almeno alla Classe B della
            Norma UNI EN ISO 52120-1.
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>${labelWithInfo('Superficie utile edificio (m²)', 'Superficie utile riscaldata dell\'edificio in cui viene installato il sistema di Building Automation. Si considera la superficie netta calpestabile degli ambienti climatizzati. <b>Non include:</b> muri, pilastri, vani tecnici non riscaldati.')}</label>
                <input type="number" id="superficieEdificio" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label>${labelWithInfo('Costo specifico sostenuto (€/m²)', 'Costo unitario dell\'intervento per metro quadrato di superficie. Si calcola dividendo la spesa totale per la superficie utile. <b>Esempio:</b> se spesa = 10.000€ e superficie = 500 m², costo specifico = 20 €/m².')}</label>
                <input type="number" id="costoSpecifico" min="0" step="0.01" required>
            </div>
        </div>

        <div class="form-group">
            <label>${labelWithInfo('Spesa totale sostenuta (€)', 'Costo totale dell\'intervento comprensivo di: <b>fornitura e installazione</b> del sistema di automazione (sensori, attuatori, unità di controllo), <b>integrazione</b> con impianti esistenti, <b>software di gestione</b>, messa in servizio. Include IVA e oneri professionali.')}</label>
            <input type="number" id="spesaTotale" min="0" step="0.01" required>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="classeB" required>
            <label for="classeB">Sistema Classe B o superiore (UNI EN ISO 52120-1) - Obbligatorio</label>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="prodottoUE">
            <label for="prodottoUE">Componenti prodotti in UE (+10%)</label>
        </div>
    `;
}

// Form A.7 - Colonnine Ricarica Veicoli Elettrici
function getFormA7() {
    return `
        <h3>A.7 - Installazione di Colonnine di Ricarica per Veicoli Elettrici</h3>

        <div class="warning">
            <strong>Condizioni Obbligatorie:</strong>
            <ul style="margin: 10px 0 0 20px;">
                <li>Deve essere realizzata congiuntamente alla sostituzione di impianti di climatizzazione invernale con pompe di calore elettriche</li>
                <li>Potenza Minima Erogabile: 7,4 kW</li>
                <li>Tipologia: Deve essere di tipologia "smart" (misurare, registrare e trasmettere potenza attiva)</li>
                <li>Modalità di Ricarica: Modo 3 o Modo 4 (norma CEI EN 61851)</li>
            </ul>
        </div>

        <div class="form-row">
            <div class="form-group">
                ${labelWithInfo('Numero colonnine', 'Numero totale di punti di ricarica (colonnine) che verranno installati.')}
                <input type="number" id="numeroColonnine" min="1" step="1" required>
            </div>
            <div class="form-group">
                ${labelWithInfo('Potenza erogabile per colonnina (kW)', 'Potenza massima erogabile da ogni colonnina. Deve essere almeno 7,4 kW per accedere agli incentivi. Tipiche: 7,4 kW (domestico), 11 kW, 22 kW (pubblico).')}
                <input type="number" id="potenzaColonnina" min="7.4" step="0.1" required>
                <small class="info-text" style="color: #006B68;">Minimo: 7,4 kW</small>
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                ${labelWithInfo('Modalità ricarica', 'Modo 3: ricarica con cavo e controllo sicurezza (wallbox domestiche). Modo 4: ricarica rapida DC (colonnine pubbliche). Entrambi conformi CEI EN 61851.')}
                <select id="modalitaRicarica">
                    <option value="modo3">Modo 3 (CEI EN 61851)</option>
                    <option value="modo4">Modo 4 (CEI EN 61851)</option>
                </select>
            </div>
            <div class="form-group">
                ${labelWithInfo('Costo per colonnina (€)', 'Costo medio di acquisto e installazione di una singola colonnina.')}
                <input type="number" id="costoColonnina" min="0" step="0.01" required>
            </div>
        </div>

        <div class="form-group">
            ${labelWithInfo('Spesa totale colonnine (€)', 'Costo complessivo per tutte le colonnine (numero colonnine × costo unitario). Include hardware, installazione, opere elettriche, IVA.')}
            <input type="number" id="spesaTotale" min="0" step="0.01" required>
        </div>

        <div class="form-group">
            ${labelWithInfo('Zona Climatica (per calcolo pompa di calore)', 'Necessaria per calcolare l\'incentivo della pompa di calore abbinata (obbligatoria per le colonnine di ricarica).')}
            <select id="zonaClimatica">
                ${ZONE_CLIMATICHE.map(z => `<option value="${z}">${z}</option>`).join('')}
            </select>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="abbinamentoPC" required>
            <label for="abbinamentoPC">Abbinato a sostituzione impianto con pompa di calore elettrica (obbligatorio)</label>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="smart" required>
            <label for="smart">Colonnine "smart" con funzionalità di misura, registrazione e trasmissione (obbligatorio)</label>
        </div>

        ${getFormPompaDiCaloreAbbinata(true)}

        <script>
            // Mostra automaticamente la sezione PDC dato che è obbligatoria
            // document.getElementById('abbinamentoPC').addEventListener('change', togglePDCSectionA7);

            function togglePDCSectionA7() {
                const abbinamentoPC = document.getElementById('abbinamentoPC').checked;
                const pdcSection = document.getElementById('pdc-section');
                if (abbinamentoPC) {
                    pdcSection.style.display = 'block';
                } else {
                    pdcSection.style.display = 'none';
                }
            }
        </script>
    `;
}

// Form A.8 - Fotovoltaico e Accumulo
function getFormA8() {
    return `
        <h3>A.8 - Fotovoltaico e Accumulo</h3>

        <div class="warning">
            <strong>Condizioni Obbligatorie:</strong>
            <ul style="margin: 10px 0 0 20px;">
                <li>Deve essere abbinato a sostituzione impianto con pompa di calore elettrica</li>
                <li>Assetto: Autoconsumo (con cessione parziale)</li>
                <li>Potenza: Non inferiore a 2 kW e non superiore a 1 MW</li>
                <li>Moduli/Inverter: Nuova costruzione, marcatura CE</li>
                <li>Moduli: Garanzia rendimento min. 90% dopo 10 anni</li>
                <li>Inverter: Rendimento europeo min. 97%</li>
            </ul>
        </div>

        <div class="form-row">
            <div class="form-group">
                ${labelWithInfo('Potenza Fotovoltaico (kW)', 'Potenza di picco dell\'impianto fotovoltaico. Deve essere tra 2 kW e 1000 kW (1 MW). Si trova nella scheda tecnica dei moduli (potenza totale = potenza modulo × numero moduli).')}
                <input type="number" id="potenzaFV" min="2" max="1000" step="0.01" required>
            </div>
            <div class="form-group">
                ${labelWithInfo('Spesa Fotovoltaico (€)', 'Costo totale dell\'impianto fotovoltaico (moduli, inverter, strutture, installazione). Sono previsti costi massimi ammissibili in base alla potenza.')}
                <input type="number" id="spesaFV" min="0" step="0.01" required>
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                ${labelWithInfo('Capacità Accumulo (kWh)', 'Capacità delle batterie di accumulo (opzionale). Espressa in kWh. Se non presente, lasciare a 0.')}
                <input type="number" id="capacitaAccumulo" min="0" step="0.01">
            </div>
            <div class="form-group">
                ${labelWithInfo('Spesa Accumulo (€)', 'Costo del sistema di accumulo (batterie + installazione). Lasciare a 0 se non presente. Costo massimo ammissibile: 1000€/kWh.')}
                <input type="number" id="spesaAccumulo" min="0" step="0.01">
            </div>
        </div>

        <div class="form-group">
            ${labelWithInfo('Zona Climatica (per calcolo pompa di calore)', 'Necessaria per calcolare l\'incentivo della pompa di calore abbinata. Seleziona la zona climatica del comune.')}
            <select id="zonaClimatica">
                ${ZONE_CLIMATICHE.map(z => `<option value="${z}">${z}</option>`).join('')}
            </select>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="abbinamentoPC_A8" required>
            <label for="abbinamentoPC_A8">Abbinato a sostituzione impianto con pompa di calore elettrica (obbligatorio)</label>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="certificazioneCE" required>
            <label for="certificazioneCE">Moduli e Inverter certificati CE (obbligatorio)</label>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="garanziaModuli" required>
            <label for="garanziaModuli">Garanzia moduli 90% dopo 10 anni (obbligatorio)</label>
        </div>

        ${getFormPompaDiCaloreAbbinata(true)}

        <script>
            // Mostra automaticamente la sezione PDC dato che è obbligatoria
            // document.getElementById('abbinamentoPC_A8').addEventListener('change', togglePDCSectionA8);

            function togglePDCSectionA8() {
                const abbinamentoPC = document.getElementById('abbinamentoPC_A8').checked;
                const pdcSection = document.getElementById('pdc-section');
                if (abbinamentoPC) {
                    pdcSection.style.display = 'block';
                } else {
                    pdcSection.style.display = 'none';
                }
            }
        </script>
    `;
}

// Form B.1 - Pompe di Calore Elettriche
function getFormB1() {
    return `
        <h3>B.1 - Pompe di Calore Elettriche</h3>

        <div class="warning">
            <strong>Requisiti Obbligatori:</strong>
            <ul style="margin: 10px 0 0 20px;">
                <li>Sostituzione di impianto esistente</li>
                <li>Efficienza (SCOP e ηs) conforme a requisiti Ecodesign zona "average"</li>
                <li>Diagnosi Energetica e APE per impianti ≥200 kW</li>
                <li>Edificio esistente con impianto climatizzazione registrato nei catasti regionali</li>
            </ul>
        </div>

        <div class="form-group">
            <label>${labelWithInfo('Tipologia Pompa di Calore', '<b>Aria-Acqua BT:</b> preleva calore dall\'aria esterna, produce acqua 35-45°C (impianti radianti). <b>Aria-Acqua MT:</b> acqua 55-65°C (radiatori tradizionali). <b>Acqua-Acqua:</b> sfrutta falda acquifera/geotermia (alta efficienza). <b>Pompa a Gas:</b> funziona a metano invece che elettricamente.')}</label>
            <select id="tipoPDC">
                <option value="aria-acqua_BT">Aria-Acqua Bassa Temperatura</option>
                <option value="aria-acqua_MT">Aria-Acqua Media Temperatura</option>
                <option value="acqua-acqua">Acqua-Acqua</option>
                <option value="gas">Pompa a Gas</option>
            </select>
        </div>

        <div class="form-group">
            <label>${labelWithInfo('Zona Climatica', 'L\'Italia è divisa in 6 zone climatiche (A-F) in base ai gradi giorno. Influenza i coefficienti di calcolo dell\'incentivo. <b>Esempi:</b> Zona A (Lampedusa), Zona C (Roma, Napoli), Zona E (Milano, Bologna), Zona F (Cuneo, Trento). Si trova nei dati climatici del comune.')}</label>
            <select id="zonaClimatica">
                ${ZONE_CLIMATICHE.map(z => `<option value="${z}">${z}</option>`).join('')}
            </select>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>${labelWithInfo('Potenza nominale (kW)', 'Potenza termica utile della pompa di calore in regime di riscaldamento. Si trova nella scheda tecnica del produttore o nella targa dell\'apparecchio. <b>Esempio:</b> 12 kW per abitazione 100-150 m². Influisce direttamente sul calcolo dell\'energia termica incentivabile.')}</label>
                <input type="number" id="potenza" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label id="labelSCOP">${labelWithInfo('SCOP (Coefficiente Prestazione Stagionale)', 'Seasonal Coefficient of Performance: rapporto tra energia termica fornita ed energia elettrica consumata nell\'intera stagione di riscaldamento. <b>Valori tipici:</b> 3,0-5,0. Più alto = più efficiente. <b>Requisiti minimi:</b> variano per tipologia (BT: ≥3,0, MT: ≥2,6).')}</label>
                <input type="number" id="scop" min="0" step="0.01" required>
                <small id="scop-info" class="info-text"></small>
            </div>
        </div>

        <div class="form-group">
            <label>${labelWithInfo('Efficienza energetica riscaldamento stagionale ηs (%)', 'Efficienza del sistema completo (pompa di calore + circolatore + controlli) calcolata secondo Regolamento UE 813/2013. Include tutte le perdite del sistema. <b>Valori tipici:</b> 110%-200% (>100% perché pompa di calore recupera calore dall\'ambiente). <b>Requisiti minimi:</b> variano per tipologia e potenza.')}</label>
            <input type="number" id="eta_s" min="0" step="1" required>
            <small id="eta-info" class="info-text"></small>
        </div>

        <div class="form-group">
            <label>${labelWithInfo('Spesa totale sostenuta (€)', 'Costo totale dell\'intervento comprensivo di: <b>fornitura e installazione</b> pompa di calore, <b>smontaggio</b> vecchio generatore, <b>adeguamento</b> impianto idraulico/elettrico, <b>terminali</b> se necessari, opere murarie, messa in servizio. Include IVA e oneri professionali (progettazione, direzione lavori).')}</label>
            <input type="number" id="spesaTotale" min="0" step="0.01" required>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="sostituzioneImpianto" required>
            <label for="sostituzioneImpianto">Sostituzione di impianto esistente (obbligatorio)</label>
        </div>

        <script>
            document.getElementById('tipoPDC').addEventListener('change', updateEfficienzaInfo);
            updateEfficienzaInfo();

            function updateEfficienzaInfo() {
                const tipo = document.getElementById('tipoPDC').value;
                const req = EFFICIENZA_MIN_PDC[tipo];
                if (tipo === 'gas') {
                    document.getElementById('labelSCOP').textContent = 'SPER (Seasonal Primary Energy Ratio):';
                    document.getElementById('scop-info').innerHTML =
                        '<span style="color: #006B68;">Valore minimo: ' + req.sper + '</span>';
                } else {
                    document.getElementById('labelSCOP').textContent = 'SCOP (Coefficiente Prestazione Stagionale):';
                    document.getElementById('scop-info').innerHTML =
                        '<span style="color: #006B68;">Valore minimo: ' + req.scop + '</span>';
                }
                document.getElementById('eta-info').innerHTML =
                    '<span style="color: #006B68;">Valore minimo: ' + req.eta_s + '%</span>';
            }
        </script>
    `;
}

// Form B.2 - Sistemi Ibridi/Bivalenti
function getFormB2() {
    return `
        <h3>B.2 - Sistemi Ibridi/Bivalenti</h3>

        <div class="warning">
            <strong>Requisiti Tecnici:</strong>
            <ul style="margin: 10px 0 0 20px;">
                <li>Pompa di calore conforme a Ecodesign</li>
                <li>Ibridi Factory Made: Rapporto PPC/PCaldaia ≤ 0.5</li>
                <li>Caldaia: A condensazione con ηs > 90% (Pn < 400 kW)</li>
                <li>Controllo: Classe V, VI, VII o VIII (impianti autonomi)</li>
            </ul>
        </div>

        <div class="form-group">
            <label>${labelWithInfo('Tipologia Sistema', '<b>Ibrido Factory Made:</b> pompa di calore + caldaia condensazione progettati e assemblati in fabbrica come sistema unico (k=1.25, incentivo maggiorato). <b>Bivalente:</b> sistemi assemblati in cantiere. Se potenza ≤35 kW → k=1.0, se >35 kW → k=1.1. Coefficiente "k" aumenta l\'incentivo.')}</label>
            <select id="tipoSistema">
                <option value="ibrido-fm">Ibrido Factory Made (k=1.25)</option>
                <option value="bivalente-35">Bivalente ≤35 kW (k=1.0)</option>
                <option value="bivalente-35p">Bivalente >35 kW (k=1.1)</option>
            </select>
        </div>

        <div class="form-group">
            <label>${labelWithInfo('Zona Climatica', 'L\'Italia è divisa in 6 zone climatiche (A-F) in base ai gradi giorno. Influenza i coefficienti di calcolo dell\'incentivo. <b>Esempi:</b> Zona A (Lampedusa), Zona C (Roma, Napoli), Zona E (Milano, Bologna), Zona F (Cuneo, Trento). Si trova nei dati climatici del comune.')}</label>
            <select id="zonaClimatica">
                ${ZONE_CLIMATICHE.map(z => `<option value="${z}">${z}</option>`).join('')}
            </select>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>${labelWithInfo('Potenza nominale pompa di calore (kW)', 'Potenza termica nominale della sola pompa di calore (non della caldaia) del sistema ibrido. Si utilizza per calcolare l\'energia termica prodotta incentivabile. Si trova nella scheda tecnica del sistema. <b>Nota:</b> nei sistemi ibridi la pompa lavora prioritariamente, la caldaia interviene in backup.')}</label>
                <input type="number" id="potenza" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label>${labelWithInfo('SCOP Pompa di Calore', 'Coefficiente di prestazione stagionale della pompa di calore del sistema ibrido. <b>Requisito minimo:</b> SCOP ≥3.1 (condizioni media temperatura). Indica l\'efficienza della pompa nel corso dell\'intera stagione di riscaldamento. Più alto = più efficiente.')}</label>
                <input type="number" id="scop" min="3.1" step="0.01" required>
                <small class="info-text" style="color: #006B68;">Valore minimo: 3.1 (media temp.)</small>
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>${labelWithInfo('Efficienza stagionale caldaia ηs (%)', 'Efficienza stagionale della caldaia a condensazione integrata nel sistema ibrido. <b>Requisito minimo:</b> ηs ≥90%. La caldaia deve essere obbligatoriamente a condensazione per accedere all\'incentivo. Si trova nella scheda prodotto secondo Regolamento UE 813/2013.')}</label>
                <input type="number" id="eta_caldaia" min="90" step="1" required>
                <small class="info-text" style="color: #006B68;">Valore minimo: 90%</small>
            </div>
            <div class="form-group">
                <label>${labelWithInfo('Spesa totale sostenuta (€)', 'Costo totale dell\'intervento comprensivo di: <b>fornitura e installazione</b> sistema ibrido completo (PDC+caldaia), <b>smontaggio</b> vecchio generatore, <b>adeguamento</b> impianto idraulico/elettrico, sistema di regolazione e controllo, opere murarie. Include IVA e oneri professionali.')}</label>
                <input type="number" id="spesaTotale" min="0" step="0.01" required>
            </div>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="caldaiaCondensazione" required>
            <label for="caldaiaCondensazione">Caldaia a condensazione (obbligatorio)</label>
        </div>
    `;
}

// Form B.3 - Generatori di Calore a Biomassa
function getFormB3() {
    return `
        <h3>B.3 - Generatori di Calore a Biomassa</h3>

        <div class="warning">
            <strong>Requisiti Obbligatori:</strong>
            <ul style="margin: 10px 0 0 20px;">
                <li>Sostituzione di generatori a biomassa, carbone, olio combustibile o gasolio</li>
                <li>Certificazione Ambientale: 5 stelle o superiore (DM 186/2017)</li>
                <li>Manutenzione biennale obbligatoria (generatore e canna fumaria) per tutta la durata dell'incentivo</li>
                <li>Caldaie ≤500 kWt: Conformità UNI EN 303-5, Classe 5</li>
                <li>Rendimento termico utile ≥87%+log(Pn)</li>
                <li>Accumulo termico ≥20 dm³/kWt</li>
                <li>Utilizzo pellet certificato UNI EN ISO 17225-2</li>
            </ul>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>${labelWithInfo('Potenza nominale (kWt)', 'Potenza termica nominale del generatore a biomassa (pellet, legna, cippato). Unità: kWt (kilowatt termici). Si trova nella targa e scheda tecnica del produttore. <b>Esempio:</b> 25 kWt per edificio 200-250 m². Determina il calcolo dell\'energia termica incentivabile.')}</label>
                <input type="number" id="potenza" min="0" step="0.1" required>
            </div>
            <div class="form-group">
                <label>${labelWithInfo('Rendimento termico utile (%)', 'Efficienza di conversione da biomassa a calore utile. <b>Requisito minimo:</b> ηu ≥ 87% + log(Pn) dove Pn è potenza nominale in kW. <b>Esempio:</b> per caldaia 25 kW → minimo 88,4%. Valori tipici: 90-95%. Si trova nella certificazione del prodotto.')}</label>
                <input type="number" id="rendimento" min="0" step="0.1" required>
                <small id="rend-info" class="info-text" style="color: #006B68;"></small>
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>${labelWithInfo('Certificazione ambientale (stelle)', 'Classificazione secondo DM 186/2017 ("Conto Aria") basata su emissioni inquinanti. <b>Requisito minimo:</b> 5 stelle. 5+ stelle = prestazioni ancora superiori con emissioni ridottissime. La certificazione è obbligatoria e rilasciata in base a test di laboratorio.')}</label>
                <select id="certificazione">
                    <option value="5">5 stelle</option>
                    <option value="5+">5+ stelle</option>
                </select>
            </div>
            <div class="form-group">
                <label>${labelWithInfo('Accumulo termico (dm³/kWt)', 'Volume del puffer/accumulo termico in rapporto alla potenza. <b>Requisito minimo:</b> 20 dm³/kWt (20 litri per kW). <b>Esempio:</b> caldaia 25 kW richiede accumulo ≥500 litri. Essenziale per ottimizzare combustione e ridurre cicli on/off.')}</label>
                <input type="number" id="accumulo" min="20" step="1" required>
                <small class="info-text" style="color: #006B68;">Minimo: 20 dm³/kWt</small>
            </div>
        </div>

        <div class="form-group">
            <label>${labelWithInfo('Spesa totale sostenuta (€)', 'Costo totale dell\'intervento comprensivo di: <b>generatore biomassa</b> certificato, <b>accumulo termico/puffer</b>, <b>smontaggio</b> vecchio impianto, <b>canna fumaria</b> se necessaria, opere idrauliche/murarie, valvole termiche, messa in servizio. Include IVA e oneri professionali. <b>Nota:</b> impegno manutenzione biennale per tutta durata incentivo.')}</label>
            <input type="number" id="spesaTotale" min="0" step="0.01" required>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="sostituzioneImpianto" required>
            <label for="sostituzioneImpianto">Sostituzione di impianto esistente (obbligatorio)</label>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="pelletCertificato" required>
            <label for="pelletCertificato">Utilizzo pellet certificato UNI EN ISO 17225-2 (obbligatorio)</label>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="classe5" required>
            <label for="classe5">Conforme UNI EN 303-5, Classe 5 (obbligatorio per ≤500 kWt)</label>
        </div>

        <script>
            document.getElementById('potenza').addEventListener('input', function() {
                const potenza = parseFloat(this.value) || 1;
                const rendMin = 87 + Math.log10(potenza);
                document.getElementById('rend-info').innerHTML =
                    '<span style="color: #006B68;">Minimo: ' + rendMin.toFixed(1) + '% (87+log(Pn))</span>';
            });
        </script>
    `;
}

// Form B.4 - Impianti Solari Termici e Solar Cooling
function getFormB4() {
    return `
        <h3>B.4 - Impianti Solari Termici e Solar Cooling</h3>

        <div class="info">
            <strong>Requisiti Tecnici:</strong>
            <ul style="margin: 10px 0 0 20px;">
                <li>Collettori: Certificazione Solar Keymark</li>
                <li>Producibilità Minima (es. collettori piani >300 kWht/m²·anno)</li>
                <li>Garanzie: Collettori e bollitori garantiti per almeno 5 anni</li>
                <li>Solar Cooling: Rapporto Sup. Solare/kWf tra 2 e 2,75</li>
            </ul>
        </div>

        <div class="form-group">
            <label>${labelWithInfo('Tipologia Impianto', '<b>Produzione ACS:</b> solo acqua calda sanitaria. <b>Integrazione riscaldamento:</b> supporto al riscaldamento ambienti + ACS. <b>Solar Cooling:</b> raffrescamento tramite macchine ad assorbimento alimentate da solare termico. <b>Processi produttivi:</b> calore per industria/agricoltura. La tipologia influenza i coefficienti di calcolo.')}</label>
            <select id="tipoImpianto">
                <option value="acs">Produzione ACS</option>
                <option value="integrazione">Integrazione riscaldamento</option>
                <option value="solare_cooling">Solar Cooling</option>
                <option value="processi">Processi produttivi</option>
            </select>
        </div>

        <div class="form-group">
            <label>${labelWithInfo('Tipo Collettori', '<b>Collettori Piani:</b> tecnologia standard, costo contenuto, buona efficienza fino 80°C. <b>Collettori Sottovuoto:</b> maggiore efficienza, migliori con basse temperature esterne/alte temp. richieste. <b>Collettori a Concentrazione:</b> per processi industriali ad alta temperatura (>100°C). Tipo influenza producibilità minima richiesta.')}</label>
            <select id="tipoCollettori">
                <option value="piani">Collettori Piani</option>
                <option value="sottovuoto">Collettori Sottovuoto</option>
                <option value="concentrazione">Collettori a Concentrazione</option>
            </select>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>${labelWithInfo('Superficie lorda collettori (m²)', 'Superficie totale lorda (con telaio) dei pannelli solari termici installati. Si trova nelle schede tecniche. <b>Dimensionamento tipico ACS:</b> 1-1.5 m²/persona. <b>Esempio:</b> famiglia 4 persone → 5-6 m². La superficie determina l\'energia termica producibile incentivabile.')}</label>
                <input type="number" id="superficieCollettori" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label>${labelWithInfo('Producibilità specifica (kWht/m²·anno)', 'Energia termica producibile per m² di collettore in un anno. <b>Requisiti minimi:</b> Piani ≥300 kWht/m²·anno, Sottovuoto ≥350, Concentrazione ≥400. Dipende da tipo collettore, orientamento, inclinazione, località. Si calcola con software certificati (es. SOL, T-SOL).')}</label>
                <input type="number" id="producibilita" min="300" step="1" required>
                <small class="info-text" style="color: #006B68;">Minimo: 300 kWht/m²·anno (piani)</small>
            </div>
        </div>

        <div class="form-group">
            <label>${labelWithInfo('Spesa totale sostenuta (€)', 'Costo totale dell\'intervento comprensivo di: <b>collettori solari</b> certificati Solar Keymark, <b>accumulo/bollitore</b> solare, <b>centralina e sonde</b>, gruppo pompaggio, tubazioni e coibentazione, valvole, antigelo, opere idrauliche/edili, posa e messa in servizio. Include IVA e oneri professionali.')}</label>
            <input type="number" id="spesaTotale" min="0" step="0.01" required>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="solarKeymark" required>
            <label for="solarKeymark">Certificazione Solar Keymark (obbligatorio)</label>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="garanzia5anni" required>
            <label for="garanzia5anni">Garanzia collettori e bollitori 5 anni (obbligatorio)</label>
        </div>
    `;
}

// Form B.5 - Scaldacqua a Pompa di Calore
function getFormB5() {
    return `
        <h3>B.3 - Scaldacqua a Pompa di Calore</h3>

        <div class="info">
            <strong>Requisito:</strong> Appartenenza alla classe di efficienza energetica A o superiore
            (Regolamento UE 812/2013).
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>${labelWithInfo('Classe Energetica', 'Classificazione efficienza energetica secondo Regolamento UE 812/2013 per scaldacqua. <b>Requisito minimo:</b> Classe A. <b>Classi superiori:</b> A+, A++, A+++ indicano consumi sempre più ridotti. Si trova nell\'etichetta energetica obbligatoria. Classe influenza l\'incentivo.')}</label>
                <select id="classeEnergetica">
                    <option value="A">Classe A</option>
                    <option value="A+">Classe A+</option>
                    <option value="A++">Classe A++</option>
                </select>
            </div>
            <div class="form-group">
                <label>${labelWithInfo('Capacità (litri)', 'Volume del serbatoio di accumulo dell\'acqua calda. <b>Dimensionamento tipico:</b> 50-80 litri/persona. <b>Esempio:</b> famiglia 4 persone → 200-300 litri. Capacità maggiore = più autonomia ma spazio maggiore. Si trova nella scheda tecnica.')}</label>
                <input type="number" id="capacita" min="0" step="1" required>
            </div>
        </div>

        <div class="form-group">
            <label>${labelWithInfo('Spesa totale sostenuta (€)', 'Costo totale dell\'intervento comprensivo di: <b>scaldacqua a pompa di calore</b> certificato classe A minimo, <b>smontaggio</b> vecchio scaldacqua elettrico/gas, <b>adeguamento</b> allacciamenti idraulici/elettrici, eventuale condensa/scarico, opere murarie. Include IVA e oneri professionali.')}</label>
            <input type="number" id="spesaTotale" min="0" step="0.01" required>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="sostituzioneScaldacqua" required>
            <label for="sostituzioneScaldacqua">Sostituzione di scaldacqua elettrico/gas (obbligatorio)</label>
        </div>
    `;
}

// Form B.6 - Allaccio a Teleriscaldamento
function getFormB6() {
    return `
        <h3>B.4 - Allaccio a Teleriscaldamento Efficiente</h3>

        <div class="warning">
            <strong>Requisito Obbligatorio:</strong> L'allaccio deve ricadere nelle reti di teleriscaldamento
            efficienti censite nell'Anagrafica territoriale teleriscaldamento e teleraffrescamento istituita da ARERA.
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>${labelWithInfo('Potenza nominale sottostazione (kW)', 'Potenza termica massima della sottostazione di scambio che collega l\'edificio alla rete di teleriscaldamento. Dimensionata in base al fabbisogno termico dell\'edificio. <b>Esempio:</b> edificio 500 m² → 50-80 kW. Si trova nel progetto tecnico dell\'allaccio.')}</label>
                <input type="number" id="potenza" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label>${labelWithInfo('Costo specifico sostenuto (€/kW)', 'Costo unitario dell\'allaccio per kW di potenza. Si calcola dividendo la spesa totale per la potenza. <b>Esempio:</b> spesa 8.000€, potenza 80 kW → costo specifico 100 €/kW. Utile per confrontare economicità dell\'intervento.')}</label>
                <input type="number" id="costoSpecifico" min="0" step="0.01" required>
            </div>
        </div>

        <div class="form-group">
            <label>${labelWithInfo('Spesa totale sostenuta (€)', 'Costo totale dell\'allaccio comprensivo di: <b>sottostazione di scambio</b> termica, <b>tubazioni</b> di collegamento edificio-rete, <b>smontaggio</b> vecchio generatore, <b>contabilizzatore</b> calore, valvole, opere edili, messa in servizio. Include IVA e oneri professionali. <b>Requisito:</b> rete deve essere "efficiente" secondo ARERA.')}</label>
            <input type="number" id="spesaTotale" min="0" step="0.01" required>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="reteEfficiente" required>
            <label for="reteEfficiente">Rete censita come "efficiente" nell'Anagrafica ARERA (obbligatorio)</label>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="sostituzioneImpianto" required>
            <label for="sostituzioneImpianto">Sostituzione di impianto esistente (obbligatorio)</label>
        </div>
    `;
}

// Form B.7 - Microcogenerazione da Fonti Rinnovabili
function getFormB7() {
    return `
        <h3>B.7 - Microcogenerazione alimentata da Fonti Rinnovabili</h3>

        <div class="warning">
            <strong>Requisiti Obbligatori:</strong>
            <ul style="margin: 10px 0 0 20px;">
                <li>Sostituzione totale o parziale di impianti esistenti</li>
                <li>Risparmio Energetico Primario (PES): Almeno pari al 10%</li>
                <li>Potenza Elettrica: Microcogeneratore <50 kWe</li>
                <li>Alimentazione: Esclusivamente da fonti rinnovabili (biomassa, biogas, bioliquidi)</li>
            </ul>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>${labelWithInfo('Potenza elettrica (kWe)', 'Potenza elettrica generata dal microcogeneratore. <b>Limite massimo:</b> 50 kWe (oltre = cogenerazione, non micro). Unità: kWe (kilowatt elettrici). Si trova nella scheda tecnica. <b>Esempio:</b> 20 kWe per piccola utenza industriale/grande edificio.')}</label>
                <input type="number" id="potenzaElettrica" min="0" max="50" step="0.1" required>
                <small class="info-text" style="color: #006B68;">Massimo: 50 kWe</small>
            </div>
            <div class="form-group">
                <label>${labelWithInfo('Potenza termica (kWt)', 'Potenza termica recuperata dal microcogeneratore. Il calore di scarto del motore viene recuperato per riscaldamento/ACS. Unità: kWt (kilowatt termici). <b>Tipico rapporto:</b> 1 kWe produce 1,5-2 kWt. <b>Esempio:</b> 20 kWe → 30-40 kWt.')}</label>
                <input type="number" id="potenzaTermica" min="0" step="0.1" required>
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>${labelWithInfo('Fonte rinnovabile', 'Combustibile utilizzato dal microcogeneratore. <b>Biomassa:</b> pellet/cippato solidi. <b>Biogas:</b> gas da digestione anaerobica (es. da depuratori, allevamenti). <b>Bioliquidi:</b> oli vegetali. <b>Requisito obbligatorio:</b> solo fonti rinnovabili, NO metano/GPL.')}</label>
                <select id="fonteRinnovabile">
                    <option value="biomassa">Biomassa</option>
                    <option value="biogas">Biogas</option>
                    <option value="bioliquidi">Bioliquidi</option>
                </select>
            </div>
            <div class="form-group">
                <label>${labelWithInfo('PES - Risparmio Energetico Primario (%)', 'Primary Energy Saving: risparmio di energia primaria rispetto a produzione separata di elettricità e calore. <b>Requisito minimo:</b> PES ≥10%. Si calcola secondo Direttiva 2012/27/UE. <b>Esempio:</b> PES 15% = risparmio 15% energia rispetto a caldaia+rete elettrica. Maggiore efficienza complessiva.')}</label>
                <input type="number" id="pes" min="10" step="0.1" required>
                <small class="info-text" style="color: #006B68;">Minimo: 10%</small>
            </div>
        </div>

        <div class="form-group">
            <label>${labelWithInfo('Spesa totale sostenuta (€)', 'Costo totale dell\'intervento comprensivo di: <b>microcogeneratore</b> certificato, <b>motore/turbina</b> e scambiatore calore, <b>sistema controllo</b> elettrico/termico, <b>smontaggio</b> impianto precedente, <b>allacciamenti</b> elettrici/termici, opere edili, messa in servizio. Include IVA e oneri professionali. <b>Requisito:</b> alimentazione esclusiva da fonti rinnovabili.')}</label>
            <input type="number" id="spesaTotale" min="0" step="0.01" required>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="sostituzioneImpianto" required>
            <label for="sostituzioneImpianto">Sostituzione totale o parziale di impianto esistente (obbligatorio)</label>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="fontiRinnovabiliEsclusive" required>
            <label for="fontiRinnovabiliEsclusive">Alimentazione esclusiva da fonti rinnovabili (obbligatorio)</label>
        </div>
    `;
}

// Helper: Calcola incentivo pompa di calore se compilata
function calcolaIncentivoPompaDiCalore(zonaClimatica) {
    const pdcPotenza = document.getElementById('pdc_potenza');
    const pdcScop = document.getElementById('pdc_scop');
    const pdcEtaS = document.getElementById('pdc_eta_s');
    const pdcSpesaTotale = document.getElementById('pdc_spesaTotale');
    const pdcTipoPDC = document.getElementById('pdc_tipoPDC');
    const pdcSostituzioneImpianto = document.getElementById('pdc_sostituzioneImpianto');

    // Verifica se i campi sono compilati
    if (!pdcPotenza || !pdcPotenza.value || !pdcSpesaTotale || !pdcSpesaTotale.value) {
        return null; // PDC non compilata
    }

    const potenza = parseFloat(pdcPotenza.value);
    const scop = parseFloat(pdcScop.value);
    const eta_s = parseFloat(pdcEtaS.value);
    const spesaTotale = parseFloat(pdcSpesaTotale.value);
    const tipoPDC = pdcTipoPDC.value;
    const sostituzioneImpianto = pdcSostituzioneImpianto.checked;

    if (!sostituzioneImpianto) {
        throw new Error('Pompa di Calore: Sostituzione di impianto esistente è obbligatoria');
    }

    // Validazione efficienza
    const effMin = EFFICIENZA_MIN_PDC[tipoPDC];
    if (tipoPDC === 'gas') {
        if (scop < effMin.sper) {
            throw new Error(`Pompa di Calore: SPER=${scop} è inferiore al valore minimo ${effMin.sper}`);
        }
    } else {
        if (scop < effMin.scop) {
            throw new Error(`Pompa di Calore: SCOP=${scop} è inferiore al valore minimo ${effMin.scop}`);
        }
    }
    if (eta_s < effMin.eta_s) {
        throw new Error(`Pompa di Calore: ηs=${eta_s}% è inferiore al valore minimo ${effMin.eta_s}%`);
    }

    // Calcolo energia termica incentivabile
    const Ci = COEFF_VALORIZZAZIONE[zonaClimatica];
    const Quf = COEFF_UTILIZZO[zonaClimatica];
    const Qu = potenza * Quf;
    const Is = Qu * Ci;

    // Calcolo incentivo
    const incentivoTeorico = Is;
    const Imax = potenza <= 35 ? 700 * potenza : 65000;
    const massimale = getMassimaleSoggetto();
    const limiteMassimale = spesaTotale * massimale.percentuale;
    const incentivoFinale = Math.min(incentivoTeorico, Imax, limiteMassimale);

    let vincoloApplicato = 'Nessun vincolo';
    if (incentivoFinale === Imax) vincoloApplicato = 'Imax = ' + Imax.toFixed(2) + ' €';
    if (incentivoFinale === limiteMassimale) vincoloApplicato = massimale.descrizione;

    const durataAnni = incentivoFinale <= 5000 ? 2 : 5;
    const rataAnnuale = incentivoFinale / durataAnni;

    return {
        tipo: 'B.1 - Pompa di Calore Elettrica',
        incentivoTeorico: incentivoTeorico,
        incentivoFinale: incentivoFinale,
        vincoloApplicato: vincoloApplicato,
        durataAnni: durataAnni,
        rataAnnuale: rataAnnuale,
        dettagli: {
            'Tipologia PDC': tipoPDC.replace('_', ' '),
            'Potenza nominale': potenza.toFixed(2) + ' kW',
            'SCOP/SPER': scop.toFixed(2),
            'ηs': eta_s + '%',
            'Energia termica (Qu)': Qu.toFixed(2) + ' kW',
            'Coefficiente Ci': Ci + ' €/kWht',
            'Spesa sostenuta': spesaTotale.toFixed(2) + ' €',
            'Zona climatica': zonaClimatica
        }
    };
}

// Funzione principale di calcolo
// Funzione per calcolare il massimale in base al soggetto richiedente
function getMassimaleSoggetto() {
    const soggettoSelect = document.getElementById('soggetto-richiedente');
    if (!soggettoSelect || !soggettoSelect.value) {
        // Default: limite 65% se non è specificato il soggetto
        return {
            percentuale: 0.65,
            descrizione: '65% spesa sostenuta (default)',
            maggiorazioni: 0
        };
    }

    const soggetto = soggettoSelect.value;
    let percentuale = 0.65;
    let descrizione = '65% spesa sostenuta';
    let maggiorazioni = 0;

    // Soggetti con 100% delle spese
    if (soggetto === 'comune_piccolo') {
        percentuale = 1.0;
        descrizione = '100% spesa sostenuta (Comune ≤15.000 abitanti)';
    } else if (soggetto === 'edificio_pubblico') {
        percentuale = 1.0;
        descrizione = '100% spesa sostenuta (Edificio Pubblico Art. 48-ter)';
    }
    // Soggetti privati e PA: 65%
    else if (soggetto === 'privato' || soggetto === 'pa') {
        percentuale = 0.65;
        descrizione = '65% spesa sostenuta';
    }
    // Imprese: percentuali specifiche + maggiorazioni
    else if (soggetto.startsWith('impresa_')) {
        // Percentuale base per tipo di impresa
        if (soggetto === 'impresa_efficienza') {
            percentuale = 0.25; // 25% base per efficienza energetica
            descrizione = 'Max 25% costi ammissibili (impresa efficienza)';
        } else if (soggetto === 'impresa_multi') {
            percentuale = 0.30; // 30% base per multi-intervento
            descrizione = 'Max 30% costi ammissibili (impresa multi-intervento)';
        } else if (soggetto === 'impresa_fer') {
            percentuale = 0.45; // 45% base per FER
            descrizione = 'Max 45% costi ammissibili (impresa FER)';
        }

        // Maggiorazioni per dimensione impresa
        const dimensioneImpresa = document.getElementById('dimensione-impresa');
        if (dimensioneImpresa) {
            const dimensione = dimensioneImpresa.value;
            if (dimensione === 'piccola') {
                maggiorazioni += 0.20; // +20%
                descrizione += ' +20% (piccola impresa)';
            } else if (dimensione === 'media') {
                maggiorazioni += 0.10; // +10%
                descrizione += ' +10% (media impresa)';
            }
        }

        // Maggiorazioni specifiche per imprese efficienza
        if (soggetto === 'impresa_efficienza') {
            const zonaAssistita = document.getElementById('zona-assistita');
            const miglioramento40 = document.getElementById('miglioramento-40');

            if (zonaAssistita && zonaAssistita.value === 'si') {
                maggiorazioni += 0.15; // +15%
                descrizione += ' +15% (zona assistita)';
            }
            if (miglioramento40 && miglioramento40.value === 'si') {
                maggiorazioni += 0.15; // +15%
                descrizione += ' +15% (miglioramento ≥40%)';
            }
        }

        // Percentuale finale con maggiorazioni
        percentuale += maggiorazioni;
    }

    return {
        percentuale: percentuale,
        descrizione: descrizione,
        maggiorazioni: maggiorazioni
    };
}

function calcolaIncentivo() {
    // Verifica che sia selezionato un soggetto richiedente
    const soggettoSelect = document.getElementById('soggetto-richiedente');
    if (!soggettoSelect || !soggettoSelect.value) {
        alert('Seleziona prima il tipo di soggetto richiedente');
        return;
    }

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
            case 'A6':
                risultato = calcolaA6();
                break;
            case 'A7':
                risultato = calcolaA7();
                break;
            case 'A8':
                risultato = calcolaA8();
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
            case 'B5':
                risultato = calcolaB5();
                break;
            case 'B6':
                risultato = calcolaB6();
                break;
            case 'B7':
                risultato = calcolaB7();
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
    const tipoStruttura = document.getElementById('tipoStruttura').value;
    const zonaClimatica = document.getElementById('zonaClimatica').value;
    const trasmittanza = parseFloat(document.getElementById('trasmittanza').value);
    const superficie = parseFloat(document.getElementById('superficie').value);
    const costoSpecifico = parseFloat(document.getElementById('costoSpecifico').value);
    const spesaTotale = parseFloat(document.getElementById('spesaTotale').value);
    const isolamentoInterno = document.getElementById('isolamentoInterno').checked;
    const multiIntervento = document.getElementById('multiIntervento').checked;
    const prodottoUE = document.getElementById('prodottoUE').checked;

    // Validazione trasmittanza
    let uMax = TRASMITTANZA_MAX[tipoStruttura][zonaClimatica];
    if (isolamentoInterno) uMax *= 1.3;

    if (trasmittanza > uMax) {
        throw new Error(`Trasmittanza U=${trasmittanza} W/m²K supera il valore massimo ammesso di ${uMax.toFixed(3)} W/m²K per zona ${zonaClimatica}`);
    }

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

    // Applicazione vincoli con massimale soggetto
    const Imax = 1000000; // €
    const massimale = getMassimaleSoggetto();
    const limiteMassimale = spesaTotale * massimale.percentuale;

    const incentivoFinale = Math.min(incentivoTeorico, Imax, limiteMassimale);

    const vincoloApplicato =
        incentivoFinale === Imax ? 'Imax (1.000.000 €)' :
        incentivoFinale === limiteMassimale ? massimale.descrizione :
        'Nessun vincolo';

    // Calcolo pompa di calore abbinata se multi-intervento
    let incentivoPDC = null;
    if (multiIntervento) {
        incentivoPDC = calcolaIncentivoPompaDiCalore(zonaClimatica);
    }

    return {
        tipo: 'A.1 - Isolamento Termico',
        incentivoTeorico: incentivoTeorico,
        incentivoFinale: incentivoFinale,
        vincoloApplicato: vincoloApplicato,
        durataAnni: 2,
        rataAnnuale: incentivoFinale / 2,
        requisitiOK: trasmittanza <= uMax,
        dettagli: {
            'Tipo struttura': tipoStruttura.charAt(0).toUpperCase() + tipoStruttura.slice(1),
            'Zona Climatica': zonaClimatica,
            'Trasmittanza U': trasmittanza.toFixed(3) + ' W/m²K',
            'U massima ammessa': uMax.toFixed(3) + ' W/m²K',
            'Superficie': superficie.toFixed(2) + ' m²',
            'Costo specifico': costoSpecifico.toFixed(2) + ' €/m²',
            'Spesa totale': spesaTotale.toFixed(2) + ' €',
            '% spesa applicata': (percSpesa * 100).toFixed(0) + '%',
            'Massimale soggetto': (massimale.percentuale * 100).toFixed(0) + '% → ' + limiteMassimale.toFixed(2) + ' €'
        },
        warning: 'Ricorda: Diagnosi Energetica preventiva e APE post-intervento sono obbligatori.',
        interventoAbbinato: incentivoPDC
    };
}

// Calcolo A.2 - Sostituzione Chiusure Trasparenti
function calcolaA2() {
    const zonaClimatica = document.getElementById('zonaClimatica').value;
    const trasmittanza = parseFloat(document.getElementById('trasmittanza').value);
    const superficie = parseFloat(document.getElementById('superficie').value);
    const costoSpecifico = parseFloat(document.getElementById('costoSpecifico').value);
    const spesaTotale = parseFloat(document.getElementById('spesaTotale').value);
    const termoreg = document.getElementById('termoreg').checked;
    const prodottoUE = document.getElementById('prodottoUE').checked;

    // Validazione termoregolazione obbligatoria
    if (!termoreg) {
        throw new Error('Presenza/installazione di termoregolazione o valvole termostatiche è obbligatoria');
    }

    // Validazione trasmittanza
    const uMax = TRASMITTANZA_MAX['finestre'][zonaClimatica];
    if (trasmittanza > uMax) {
        throw new Error(`Trasmittanza U=${trasmittanza} W/m²K supera il valore massimo ammesso di ${uMax} W/m²K per zona ${zonaClimatica}`);
    }

    // Costi massimi ammissibili
    const Cmax = ['A', 'B', 'C'].includes(zonaClimatica) ? 700 : 800;
    const costoAmmissibile = Math.min(costoSpecifico, Cmax);

    // % spesa base
    let percSpesa = 0.40;
    if (prodottoUE) {
        percSpesa += 0.10;
    }

    // Calcolo incentivo teorico
    const incentivoTeorico = percSpesa * costoAmmissibile * superficie;

    // Applicazione vincoli
    const Imax = 500000;
    const massimale = getMassimaleSoggetto();
    const limiteMassimale = spesaTotale * massimale.percentuale;

    const incentivoFinale = Math.min(incentivoTeorico, Imax, limiteMassimale);

    const vincoloApplicato =
        incentivoFinale === Imax ? 'Imax (500.000 €)' :
        incentivoFinale === limiteMassimale ? massimale.descrizione :
        costoSpecifico > Cmax ? 'Costo massimo ammissibile' :
        'Nessun vincolo';

    return {
        tipo: 'A.2 - Sostituzione Chiusure Trasparenti',
        incentivoTeorico: incentivoTeorico,
        incentivoFinale: incentivoFinale,
        vincoloApplicato: vincoloApplicato,
        durataAnni: 2,
        rataAnnuale: incentivoFinale / 2,
        requisitiOK: trasmittanza <= uMax && termoreg,
        dettagli: {
            'Zona Climatica': zonaClimatica,
            'Trasmittanza U': trasmittanza.toFixed(3) + ' W/m²K',
            'U massima ammessa': uMax.toFixed(2) + ' W/m²K',
            'Superficie': superficie.toFixed(2) + ' m²',
            'Costo specifico sostenuto': costoSpecifico.toFixed(2) + ' €/m²',
            'Costo massimo ammissibile': Cmax.toFixed(2) + ' €/m²',
            'Costo utilizzato': costoAmmissibile.toFixed(2) + ' €/m²',
            'Spesa totale': spesaTotale.toFixed(2) + ' €',
            '% spesa applicata': (percSpesa * 100).toFixed(0) + '%',
            'Massimale soggetto': (massimale.percentuale * 100).toFixed(0) + '% → ' + limiteMassimale.toFixed(2) + ' €'
        }
    };
}

// Calcolo A.3 - Schermature Solari
function calcolaA3() {
    const superficie = parseFloat(document.getElementById('superficie').value);
    const costoSpecifico = parseFloat(document.getElementById('costoSpecifico').value);
    const spesaTotale = parseFloat(document.getElementById('spesaTotale').value);
    const abbinamentoInfissi = document.getElementById('abbinamentoInfissi').checked;
    const classe3 = document.getElementById('classe3').checked;
    const automatico = document.getElementById('automatico').checked;
    const prodottoUE = document.getElementById('prodottoUE').checked;

    if (!abbinamentoInfissi) {
        throw new Error('Abbinamento a sostituzione chiusure trasparenti è obbligatorio');
    }

    if (!classe3) {
        throw new Error('Classe 3 o superiore (UNI EN 14501) è obbligatoria');
    }

    if (!automatico) {
        throw new Error('Meccanismi automatici con rilevazione radiazione solare sono obbligatori');
    }

    // % spesa base
    let percSpesa = 0.40;
    if (prodottoUE) {
        percSpesa += 0.10;
    }

    // Calcolo incentivo teorico
    const incentivoTeorico = percSpesa * costoSpecifico * superficie;

    // Applicazione vincoli
    const Imax = 200000; // € (stima)
    const massimale = getMassimaleSoggetto();
    const limiteMassimale = spesaTotale * massimale.percentuale;

    const incentivoFinale = Math.min(incentivoTeorico, Imax, limiteMassimale);

    const vincoloApplicato =
        incentivoFinale === Imax ? 'Imax (200.000 €)' :
        incentivoFinale === limiteMassimale ? massimale.descrizione :
        'Nessun vincolo';

    return {
        tipo: 'A.3 - Schermature Solari',
        incentivoTeorico: incentivoTeorico,
        incentivoFinale: incentivoFinale,
        vincoloApplicato: vincoloApplicato,
        durataAnni: 2,
        rataAnnuale: incentivoFinale / 2,
        requisitiOK: abbinamentoInfissi && classe3 && automatico,
        dettagli: {
            'Superficie': superficie.toFixed(2) + ' m²',
            'Costo specifico': costoSpecifico.toFixed(2) + ' €/m²',
            'Spesa totale': spesaTotale.toFixed(2) + ' €',
            '% spesa applicata': (percSpesa * 100).toFixed(0) + '%',
            'Massimale soggetto': (massimale.percentuale * 100).toFixed(0) + '% → ' + limiteMassimale.toFixed(2) + ' €'
        },
        warning: 'Abbinamento obbligatorio a sostituzione chiusure trasparenti.'
    };
}

// Calcolo A.4 - Trasformazione NZEB
function calcolaA4() {
    const zonaClimatica = document.getElementById('zonaClimatica').value;
    const superficie = parseFloat(document.getElementById('superficieEdificio').value);
    const costoSpecifico = parseFloat(document.getElementById('costoSpecifico').value);
    const spesaTotale = parseFloat(document.getElementById('spesaTotale').value);
    const certificazioneNZEB = document.getElementById('certificazioneNZEB').checked;
    const prodottoUE = document.getElementById('prodottoUE').checked;

    if (!certificazioneNZEB) {
        throw new Error('La certificazione APE come NZEB è obbligatoria per questo intervento');
    }

    // Costi massimi ammissibili
    const Cmax = ['A', 'B', 'C'].includes(zonaClimatica) ? 1000 : 1300;
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
    const massimale = getMassimaleSoggetto();
    const limiteMassimale = spesaTotale * massimale.percentuale;

    const incentivoFinale = Math.min(incentivoTeorico, Imax, limiteMassimale);

    const vincoloApplicato =
        incentivoFinale === Imax ? `Imax (${Imax.toLocaleString('it-IT')} €)` :
        incentivoFinale === limiteMassimale ? massimale.descrizione :
        costoSpecifico > Cmax ? 'Costo massimo ammissibile' :
        'Nessun vincolo';

    return {
        tipo: 'A.3 - Trasformazione NZEB',
        incentivoTeorico: incentivoTeorico,
        incentivoFinale: incentivoFinale,
        vincoloApplicato: vincoloApplicato,
        durataAnni: 5,
        rataAnnuale: incentivoFinale / 5,
        requisitiOK: certificazioneNZEB,
        dettagli: {
            'Zona Climatica': zonaClimatica,
            'Superficie edificio': superficie.toFixed(2) + ' m²',
            'Costo specifico sostenuto': costoSpecifico.toFixed(2) + ' €/m²',
            'Costo massimo ammissibile': Cmax.toFixed(2) + ' €/m²',
            'Costo utilizzato': costoAmmissibile.toFixed(2) + ' €/m²',
            'Spesa totale': spesaTotale.toFixed(2) + ' €',
            '% spesa applicata': (percSpesa * 100).toFixed(0) + '%',
            'Massimale soggetto': (massimale.percentuale * 100).toFixed(0) + '% → ' + limiteMassimale.toFixed(2) + ' €'
        },
        warning: 'Intervento ammesso solo con ristrutturazione edilizia o demolizione/ricostruzione. APE NZEB e Diagnosi Energetica obbligatori.'
    };
}

// Calcolo A.5 - Illuminazione
function calcolaA5() {
    const potenzaPrecedente = parseFloat(document.getElementById('potenzaPrecedente').value);
    const potenzaNuova = parseFloat(document.getElementById('potenzaNuova').value);
    const efficienzaLuminosa = parseFloat(document.getElementById('efficienzaLuminosa').value);
    const cri = parseFloat(document.getElementById('cri').value);
    const spesaTotale = parseFloat(document.getElementById('spesaTotale').value);
    const sostituzioneSistema = document.getElementById('sostituzioneSistema').checked;
    const prodottoUE = document.getElementById('prodottoUE').checked;
    const ambitoIlluminazione = document.getElementById('ambitoIlluminazione').value;

    if (!sostituzioneSistema) {
        throw new Error('Sostituzione di sistema esistente è obbligatoria');
    }

    // Verifica potenza max 50%
    if (potenzaNuova > (potenzaPrecedente * 0.5)) {
        throw new Error(`Potenza installata (${potenzaNuova} kW) supera il 50% della potenza sostituita (max ${(potenzaPrecedente * 0.5).toFixed(2)} kW)`);
    }

    // Verifica efficienza minima
    if (efficienzaLuminosa < 80) {
        throw new Error('Efficienza luminosa deve essere almeno 80 lm/W');
    }

    // Verifica CRI minimo
    const criMin = ambitoIlluminazione === 'interno' ? 80 : 60;
    if (cri < criMin) {
        throw new Error(`CRI (${cri}) inferiore al minimo richiesto (>${criMin} per ${ambitoIlluminazione})`);
    }

    // % spesa base
    let percSpesa = 0.40;
    if (prodottoUE) {
        percSpesa += 0.10;
    }

    // Calcolo incentivo teorico
    const incentivoTeorico = percSpesa * spesaTotale;

    // Applicazione vincoli
    const Imax = 150000; // € (stima)
    const massimale = getMassimaleSoggetto();
    const limiteMassimale = spesaTotale * massimale.percentuale;

    const incentivoFinale = Math.min(incentivoTeorico, Imax, limiteMassimale);

    const vincoloApplicato =
        incentivoFinale === Imax ? 'Imax (150.000 €)' :
        incentivoFinale === limiteMassimale ? massimale.descrizione :
        'Nessun vincolo';

    return {
        tipo: 'A.5 - Sostituzione Sistemi Illuminazione',
        incentivoTeorico: incentivoTeorico,
        incentivoFinale: incentivoFinale,
        vincoloApplicato: vincoloApplicato,
        durataAnni: 2,
        rataAnnuale: incentivoFinale / 2,
        requisitiOK: sostituzioneSistema && efficienzaLuminosa >= 80 && cri >= criMin && potenzaNuova <= (potenzaPrecedente * 0.5),
        dettagli: {
            'Ambito': ambitoIlluminazione,
            'Potenza precedente': potenzaPrecedente.toFixed(2) + ' kW',
            'Potenza nuova': potenzaNuova.toFixed(2) + ' kW (max ' + (potenzaPrecedente * 0.5).toFixed(2) + ' kW)',
            'Efficienza luminosa': efficienzaLuminosa + ' lm/W (min: 80)',
            'CRI': cri + ' (min: >' + criMin + ')',
            'Spesa totale': spesaTotale.toFixed(2) + ' €',
            '% spesa applicata': (percSpesa * 100).toFixed(0) + '%',
            'Massimale soggetto': (massimale.percentuale * 100).toFixed(0) + '% → ' + limiteMassimale.toFixed(2) + ' €'
        }
    };
}

// Calcolo A.6 - Building Automation
function calcolaA6() {
    const superficie = parseFloat(document.getElementById('superficieEdificio').value);
    const costoSpecifico = parseFloat(document.getElementById('costoSpecifico').value);
    const spesaTotale = parseFloat(document.getElementById('spesaTotale').value);
    const classeB = document.getElementById('classeB').checked;
    const prodottoUE = document.getElementById('prodottoUE').checked;

    if (!classeB) {
        throw new Error('Il sistema deve appartenere almeno alla Classe B (UNI EN ISO 52120-1)');
    }

    // Costo massimo ammissibile
    const Cmax = 60;
    const costoAmmissibile = Math.min(costoSpecifico, Cmax);

    // % spesa base
    let percSpesa = 0.40;
    if (prodottoUE) {
        percSpesa += 0.10;
    }

    // Calcolo incentivo teorico
    const incentivoTeorico = percSpesa * costoAmmissibile * superficie;

    // Applicazione vincoli
    const Imax = 100000;
    const massimale = getMassimaleSoggetto();
    const limiteMassimale = spesaTotale * massimale.percentuale;

    const incentivoFinale = Math.min(incentivoTeorico, Imax, limiteMassimale);

    const vincoloApplicato =
        incentivoFinale === Imax ? 'Imax (100.000 €)' :
        incentivoFinale === limiteMassimale ? massimale.descrizione :
        costoSpecifico > Cmax ? 'Costo massimo ammissibile' :
        'Nessun vincolo';

    return {
        tipo: 'A.4 - Building Automation',
        incentivoTeorico: incentivoTeorico,
        incentivoFinale: incentivoFinale,
        vincoloApplicato: vincoloApplicato,
        durataAnni: 2,
        rataAnnuale: incentivoFinale / 2,
        requisitiOK: classeB,
        dettagli: {
            'Superficie edificio': superficie.toFixed(2) + ' m²',
            'Costo specifico sostenuto': costoSpecifico.toFixed(2) + ' €/m²',
            'Costo massimo ammissibile': Cmax.toFixed(2) + ' €/m²',
            'Costo utilizzato': costoAmmissibile.toFixed(2) + ' €/m²',
            'Spesa totale': spesaTotale.toFixed(2) + ' €',
            '% spesa applicata': (percSpesa * 100).toFixed(0) + '%',
            'Massimale soggetto': (massimale.percentuale * 100).toFixed(0) + '% → ' + limiteMassimale.toFixed(2) + ' €'
        }
    };
}

// Calcolo A.7 - Colonnine Ricarica
function calcolaA7() {
    const numeroColonnine = parseFloat(document.getElementById('numeroColonnine').value);
    const potenzaColonnina = parseFloat(document.getElementById('potenzaColonnina').value);
    const costoColonnina = parseFloat(document.getElementById('costoColonnina').value);
    const spesaTotale = parseFloat(document.getElementById('spesaTotale').value);
    const zonaClimatica = document.getElementById('zonaClimatica').value;
    const abbinamentoPC = document.getElementById('abbinamentoPC').checked;
    const smart = document.getElementById('smart').checked;

    if (!abbinamentoPC) {
        throw new Error('Abbinamento a sostituzione impianto con pompa di calore elettrica è obbligatorio');
    }

    if (!smart) {
        throw new Error('Colonnine "smart" con funzionalità di misura, registrazione e trasmissione sono obbligatorie');
    }

    if (potenzaColonnina < 7.4) {
        throw new Error('Potenza erogabile deve essere almeno 7,4 kW');
    }

    // Calcolo incentivo semplificato (40% della spesa)
    const percSpesa = 0.40;
    const incentivoTeorico = percSpesa * spesaTotale;

    // Vincoli
    const Imax = 100000; // € (stima)
    const massimale = getMassimaleSoggetto();
    const limiteMassimale = spesaTotale * massimale.percentuale;

    const incentivoFinale = Math.min(incentivoTeorico, Imax, limiteMassimale);

    const vincoloApplicato =
        incentivoFinale === Imax ? 'Imax (100.000 €)' :
        incentivoFinale === limiteMassimale ? massimale.descrizione :
        'Nessun vincolo';

    // Calcolo pompa di calore abbinata (obbligatoria per A.7)
    const incentivoPDC = calcolaIncentivoPompaDiCalore(zonaClimatica);
    if (!incentivoPDC && abbinamentoPC) {
        throw new Error('Devi compilare i dati della pompa di calore abbinata (obbligatoria per le colonnine di ricarica)');
    }

    return {
        tipo: 'A.7 - Colonnine Ricarica Veicoli Elettrici',
        incentivoTeorico: incentivoTeorico,
        incentivoFinale: incentivoFinale,
        vincoloApplicato: vincoloApplicato,
        durataAnni: 2,
        rataAnnuale: incentivoFinale / 2,
        requisitiOK: abbinamentoPC && smart && potenzaColonnina >= 7.4,
        dettagli: {
            'Numero colonnine': numeroColonnine,
            'Potenza per colonnina': potenzaColonnina.toFixed(1) + ' kW (min: 7,4 kW)',
            'Costo per colonnina': costoColonnina.toFixed(2) + ' €',
            'Spesa totale': spesaTotale.toFixed(2) + ' €',
            '% spesa applicata': (percSpesa * 100).toFixed(0) + '%',
            'Massimale soggetto': (massimale.percentuale * 100).toFixed(0) + '% → ' + limiteMassimale.toFixed(2) + ' €'
        },
        warning: 'Abbinamento obbligatorio a pompa di calore elettrica. Potenza min 7,4 kW, tipologia smart, Modo 3 o 4.',
        interventoAbbinato: incentivoPDC
    };
}

// Calcolo A.8 - Fotovoltaico e Accumulo
function calcolaA8() {
    const potenzaFV = parseFloat(document.getElementById('potenzaFV').value);
    const spesaFV = parseFloat(document.getElementById('spesaFV').value);
    const capacitaAccumulo = parseFloat(document.getElementById('capacitaAccumulo').value) || 0;
    const spesaAccumulo = parseFloat(document.getElementById('spesaAccumulo').value) || 0;
    const zonaClimatica = document.getElementById('zonaClimatica').value;
    const abbinamentoPC = document.getElementById('abbinamentoPC_A8').checked;
    const certificazioneCE = document.getElementById('certificazioneCE').checked;
    const garanziaModuli = document.getElementById('garanziaModuli').checked;

    if (!abbinamentoPC) {
        throw new Error('Abbinamento a pompa di calore elettrica è obbligatorio');
    }

    if (!certificazioneCE) {
        throw new Error('Certificazione CE di moduli e inverter è obbligatoria');
    }

    if (!garanziaModuli) {
        throw new Error('Garanzia moduli 90% dopo 10 anni è obbligatoria');
    }

    if (potenzaFV < 2) {
        throw new Error('Potenza FV non può essere inferiore a 2 kW');
    }

    if (potenzaFV > 1000) {
        throw new Error('Potenza FV non può superare 1 MW (1000 kW)');
    }

    // Costo massimo ammissibile FV
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
    const CmaxAccumulo = 1000;
    const costoAmmissibileAccumulo = capacitaAccumulo > 0 ?
        Math.min(spesaAccumulo / capacitaAccumulo, CmaxAccumulo) * capacitaAccumulo : 0;

    // Calcolo incentivi
    const incentivoFV = 0.20 * costoAmmissibileFV;
    const incentivoAccumulo = 0.20 * costoAmmissibileAccumulo;
    const incentivoTeorico = incentivoFV + incentivoAccumulo;

    // Calcolo pompa di calore abbinata (obbligatoria per A.8)
    const incentivoPDC = calcolaIncentivoPompaDiCalore(zonaClimatica);
    if (!incentivoPDC && abbinamentoPC) {
        throw new Error('Devi compilare i dati della pompa di calore abbinata (obbligatoria per fotovoltaico)');
    }

    // Vincolo: non può superare l'incentivo della pompa di calore abbinata
    const incentivoPC_valore = incentivoPDC ? incentivoPDC.incentivoFinale : 0;
    const incentivoFinale = Math.min(incentivoTeorico, incentivoPC_valore);

    const vincoloApplicato =
        incentivoFinale === incentivoPC_valore ? 'Incentivo pompa di calore abbinata' :
        'Nessun vincolo';

    return {
        tipo: 'A.8 - Fotovoltaico e Accumulo',
        incentivoTeorico: incentivoTeorico,
        incentivoFinale: incentivoFinale,
        vincoloApplicato: vincoloApplicato,
        durataAnni: 2,
        rataAnnuale: incentivoFinale / 2,
        requisitiOK: certificazioneCE && garanziaModuli && potenzaFV >= 2 && potenzaFV <= 1000,
        dettagli: {
            'Potenza FV': potenzaFV.toFixed(2) + ' kW',
            'Spesa FV': spesaFV.toFixed(2) + ' €',
            'Costo max FV': CmaxFV.toFixed(2) + ' €/kW',
            'Incentivo FV': incentivoFV.toFixed(2) + ' €',
            'Capacità Accumulo': capacitaAccumulo.toFixed(2) + ' kWh',
            'Spesa Accumulo': spesaAccumulo.toFixed(2) + ' €',
            'Incentivo Accumulo': incentivoAccumulo.toFixed(2) + ' €',
            'Incentivo PC abbinata (calcolato)': incentivoPC_valore.toFixed(2) + ' €'
        },
        warning: 'Deve essere abbinato a sostituzione impianto con pompa di calore elettrica. Assetto in autoconsumo.',
        interventoAbbinato: incentivoPDC
    };
}

// Calcolo B.1 - Pompe di Calore Elettriche
function calcolaB1() {
    const tipoPDC = document.getElementById('tipoPDC').value;
    const zonaClimatica = document.getElementById('zonaClimatica').value;
    const potenza = parseFloat(document.getElementById('potenza').value);
    const scop = parseFloat(document.getElementById('scop').value);
    const eta_s = parseFloat(document.getElementById('eta_s').value);
    const spesaTotale = parseFloat(document.getElementById('spesaTotale').value);
    const sostituzioneImpianto = document.getElementById('sostituzioneImpianto').checked;

    if (!sostituzioneImpianto) {
        throw new Error('Sostituzione di impianto esistente è obbligatoria');
    }

    // Validazione efficienza minima
    const reqMin = EFFICIENZA_MIN_PDC[tipoPDC];
    const scopMin = tipoPDC === 'gas' ? reqMin.sper : reqMin.scop;

    if (scop < scopMin) {
        const label = tipoPDC === 'gas' ? 'SPER' : 'SCOP';
        throw new Error(`${label} = ${scop} inferiore al valore minimo Ecodesign di ${scopMin}`);
    }

    if (eta_s < reqMin.eta_s) {
        throw new Error(`ηs = ${eta_s}% inferiore al valore minimo Ecodesign di ${reqMin.eta_s}%`);
    }

    // Durata incentivo
    const durataAnni = potenza <= 35 ? 2 : 5;

    // Coefficiente di valorizzazione e utilizzo
    const Ci = COEFF_VALORIZZAZIONE[zonaClimatica];
    const Quf = COEFF_UTILIZZO[zonaClimatica];

    // Energia termica incentivata annuale
    const Ei = potenza * 2000 * Quf * ((scop - 1) / scop);

    // Incentivo totale
    const incentivoTeorico = durataAnni * Ei * Ci;

    // Applicazione vincoli
    const massimale = getMassimaleSoggetto();
    const limiteMassimale = spesaTotale * massimale.percentuale;

    const incentivoFinale = Math.min(incentivoTeorico, limiteMassimale);

    const vincoloApplicato =
        incentivoFinale === limiteMassimale ? massimale.descrizione :
        'Nessun vincolo';

    return {
        tipo: 'B.1 - Pompe di Calore Elettriche',
        incentivoTeorico: incentivoTeorico,
        incentivoFinale: incentivoFinale,
        vincoloApplicato: vincoloApplicato,
        durataAnni: durataAnni,
        rataAnnuale: incentivoFinale / durataAnni,
        requisitiOK: scop >= scopMin && eta_s >= reqMin.eta_s && sostituzioneImpianto,
        dettagli: {
            'Tipologia': tipoPDC.replace('_', ' '),
            'Zona Climatica': zonaClimatica,
            'Potenza': potenza.toFixed(2) + ' kW',
            [tipoPDC === 'gas' ? 'SPER' : 'SCOP']: scop.toFixed(2) + ' (min: ' + scopMin + ')',
            'ηs': eta_s.toFixed(0) + '% (min: ' + reqMin.eta_s + '%)',
            'Energia incentivata (Ei)': Ei.toFixed(2) + ' kWht/anno',
            'Coeff. valorizzazione (Ci)': Ci.toFixed(3) + ' €/kWht',
            'Spesa totale': spesaTotale.toFixed(2) + ' €',
            'Massimale soggetto': (massimale.percentuale * 100).toFixed(0) + '% → ' + limiteMassimale.toFixed(2) + ' €',
            'Durata': durataAnni + ' anni'
        },
        warning: 'Richiesta Diagnosi Energetica e APE per impianti ≥200 kW.'
    };
}

// Calcolo B.2 - Sistemi Ibridi/Bivalenti
function calcolaB2() {
    const tipoSistema = document.getElementById('tipoSistema').value;
    const zonaClimatica = document.getElementById('zonaClimatica').value;
    const potenza = parseFloat(document.getElementById('potenza').value);
    const scop = parseFloat(document.getElementById('scop').value);
    const eta_caldaia = parseFloat(document.getElementById('eta_caldaia').value);
    const spesaTotale = parseFloat(document.getElementById('spesaTotale').value);
    const caldaiaCondensazione = document.getElementById('caldaiaCondensazione').checked;

    if (!caldaiaCondensazione) {
        throw new Error('Caldaia a condensazione è obbligatoria');
    }

    if (scop < 3.1) {
        throw new Error('SCOP pompa di calore deve essere almeno 3.1 (requisiti Ecodesign)');
    }

    if (eta_caldaia < 90) {
        throw new Error('Efficienza stagionale caldaia deve essere almeno 90%');
    }

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
    const massimale = getMassimaleSoggetto();
    const limiteMassimale = spesaTotale * massimale.percentuale;

    const incentivoFinale = Math.min(incentivoTeorico, limiteMassimale);

    const vincoloApplicato =
        incentivoFinale === limiteMassimale ? massimale.descrizione :
        'Nessun vincolo';

    return {
        tipo: 'B.2 - Sistemi Ibridi/Bivalenti',
        incentivoTeorico: incentivoTeorico,
        incentivoFinale: incentivoFinale,
        vincoloApplicato: vincoloApplicato,
        durataAnni: durataAnni,
        rataAnnuale: incentivoFinale / durataAnni,
        requisitiOK: scop >= 3.1 && eta_caldaia >= 90 && caldaiaCondensazione,
        dettagli: {
            'Tipo Sistema': tipoSistema.replace(/-/g, ' '),
            'Coefficiente k': k.toFixed(2),
            'Zona Climatica': zonaClimatica,
            'Potenza PC': potenza.toFixed(2) + ' kW',
            'SCOP': scop.toFixed(2) + ' (min: 3.1)',
            'ηs caldaia': eta_caldaia.toFixed(0) + '% (min: 90%)',
            'Energia incentivata (Ei)': Ei.toFixed(2) + ' kWht/anno',
            'Coeff. valorizzazione (Ci)': Ci.toFixed(3) + ' €/kWht',
            'Spesa totale': spesaTotale.toFixed(2) + ' €',
            'Massimale soggetto': (massimale.percentuale * 100).toFixed(0) + '% → ' + limiteMassimale.toFixed(2) + ' €',
            'Durata': durataAnni + ' anni'
        }
    };
}

// Calcolo B.3 - Generatori Biomassa
function calcolaB3() {
    const potenza = parseFloat(document.getElementById('potenza').value);
    const rendimento = parseFloat(document.getElementById('rendimento').value);
    const accumulo = parseFloat(document.getElementById('accumulo').value);
    const spesaTotale = parseFloat(document.getElementById('spesaTotale').value);
    const sostituzioneImpianto = document.getElementById('sostituzioneImpianto').checked;
    const pelletCertificato = document.getElementById('pelletCertificato').checked;
    const classe5 = document.getElementById('classe5').checked;

    if (!sostituzioneImpianto || !pelletCertificato || !classe5) {
        throw new Error('Tutti i requisiti obbligatori devono essere soddisfatti');
    }

    const rendMin = 87 + Math.log10(potenza);
    if (rendimento < rendMin) {
        throw new Error(`Rendimento ${rendimento}% inferiore al minimo ${rendMin.toFixed(1)}%`);
    }

    if (accumulo < 20) {
        throw new Error('Accumulo termico deve essere almeno 20 dm³/kWt');
    }

    // Calcolo semplificato: 65% della spesa
    const incentivoTeorico = 0.65 * spesaTotale;
    const massimale = getMassimaleSoggetto();
    const limiteMassimale = spesaTotale * massimale.percentuale;
    const incentivoFinale = Math.min(incentivoTeorico, limiteMassimale);

    return {
        tipo: 'B.3 - Generatori Biomassa',
        incentivoTeorico: incentivoTeorico,
        incentivoFinale: incentivoFinale,
        vincoloApplicato: '65% spesa sostenuta',
        durataAnni: 5,
        rataAnnuale: incentivoFinale / 5,
        requisitiOK: sostituzioneImpianto && pelletCertificato && classe5 && rendimento >= rendMin && accumulo >= 20,
        dettagli: {
            'Potenza': potenza.toFixed(1) + ' kWt',
            'Rendimento': rendimento.toFixed(1) + '% (min: ' + rendMin.toFixed(1) + '%)',
            'Accumulo': accumulo + ' dm³/kWt (min: 20)',
            'Spesa totale': spesaTotale.toFixed(2) + ' €',
            'Durata': '5 anni'
        },
        warning: 'Certificazione 5 stelle, manutenzione biennale obbligatoria, pellet certificato.'
    };
}

// Calcolo B.4 - Solare Termico
function calcolaB4() {
    const superficieCollettori = parseFloat(document.getElementById('superficieCollettori').value);
    const producibilita = parseFloat(document.getElementById('producibilita').value);
    const spesaTotale = parseFloat(document.getElementById('spesaTotale').value);
    const solarKeymark = document.getElementById('solarKeymark').checked;
    const garanzia5anni = document.getElementById('garanzia5anni').checked;

    if (!solarKeymark || !garanzia5anni) {
        throw new Error('Certificazione Solar Keymark e garanzia 5 anni sono obbligatorie');
    }

    if (producibilita < 300) {
        throw new Error('Producibilità deve essere almeno 300 kWht/m²·anno');
    }

    // Calcolo semplificato: 65% della spesa
    const incentivoTeorico = 0.65 * spesaTotale;
    const massimale = getMassimaleSoggetto();
    const limiteMassimale = spesaTotale * massimale.percentuale;
    const incentivoFinale = Math.min(incentivoTeorico, limiteMassimale);

    return {
        tipo: 'B.4 - Impianti Solari Termici',
        incentivoTeorico: incentivoTeorico,
        incentivoFinale: incentivoFinale,
        vincoloApplicato: '65% spesa sostenuta',
        durataAnni: 2,
        rataAnnuale: incentivoFinale / 2,
        requisitiOK: solarKeymark && garanzia5anni && producibilita >= 300,
        dettagli: {
            'Superficie collettori': superficieCollettori.toFixed(2) + ' m²',
            'Producibilità': producibilita + ' kWht/m²·anno (min: 300)',
            'Spesa totale': spesaTotale.toFixed(2) + ' €',
            'Durata': '2 anni'
        }
    };
}

// Calcolo B.5 - Scaldacqua a Pompa di Calore
function calcolaB5() {
    const classeEnergetica = document.getElementById('classeEnergetica').value;
    const capacita = parseFloat(document.getElementById('capacita').value);
    const spesaTotale = parseFloat(document.getElementById('spesaTotale').value);
    const sostituzioneScaldacqua = document.getElementById('sostituzioneScaldacqua').checked;

    if (!sostituzioneScaldacqua) {
        throw new Error('Sostituzione di scaldacqua elettrico/gas è obbligatoria');
    }

    // Massimali in base a classe e capacità
    let Imax;
    if (classeEnergetica === 'A') {
        Imax = capacita <= 150 ? 500 : 1100;
    } else if (classeEnergetica === 'A+') {
        Imax = capacita <= 150 ? 700 : 1500;
    } else { // A++
        Imax = capacita <= 150 ? 900 : 2000;
    }

    // Calcolo incentivo
    const incentivoTeorico = 0.40 * spesaTotale;

    // Applicazione vincoli
    const incentivoFinale = Math.min(incentivoTeorico, Imax);

    const vincoloApplicato =
        incentivoFinale === Imax ? `Imax (${Imax} €)` :
        'Nessun vincolo';

    // Verifica erogazione unica rata
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
        requisitiOK: sostituzioneScaldacqua,
        dettagli: {
            'Classe Energetica': classeEnergetica + ' (Reg. UE 812/2013)',
            'Capacità': capacita + ' litri',
            'Spesa totale': spesaTotale.toFixed(2) + ' €',
            'Massimale (Imax)': Imax + ' €',
            'Modalità erogazione': erogazione
        }
    };
}

// Calcolo B.6 - Allaccio a Teleriscaldamento
function calcolaB6() {
    const potenza = parseFloat(document.getElementById('potenza').value);
    const costoSpecifico = parseFloat(document.getElementById('costoSpecifico').value);
    const spesaTotale = parseFloat(document.getElementById('spesaTotale').value);
    const reteEfficiente = document.getElementById('reteEfficiente').checked;
    const sostituzioneImpianto = document.getElementById('sostituzioneImpianto').checked;

    if (!reteEfficiente) {
        throw new Error('La rete deve essere censita come "efficiente" nell\'Anagrafica ARERA');
    }

    if (!sostituzioneImpianto) {
        throw new Error('Sostituzione di impianto esistente è obbligatoria');
    }

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
    const massimale = getMassimaleSoggetto();
    const limiteMassimale = spesaTotale * massimale.percentuale;
    const incentivoFinale = Math.min(incentivoTeorico, Imax, limiteMassimale);

    const vincoloApplicato =
        incentivoFinale === Imax ? `Imax (${Imax.toLocaleString('it-IT')} €)` :
        incentivoFinale === limiteMassimale ? massimale.descrizione :
        'Nessun vincolo';

    return {
        tipo: 'B.4 - Allaccio a Teleriscaldamento',
        incentivoTeorico: incentivoTeorico,
        incentivoFinale: incentivoFinale,
        vincoloApplicato: vincoloApplicato,
        durataAnni: 5,
        rataAnnuale: incentivoFinale / 5,
        requisitiOK: reteEfficiente && sostituzioneImpianto,
        dettagli: {
            'Potenza sottostazione': potenza.toFixed(2) + ' kW',
            'Costo specifico': costoSpecifico.toFixed(2) + ' €/kW',
            'Spesa totale': spesaTotale.toFixed(2) + ' €',
            'Massimale (Imax)': Imax.toLocaleString('it-IT') + ' €',
            'Massimale soggetto': (massimale.percentuale * 100).toFixed(0) + '% → ' + limiteMassimale.toFixed(2) + ' €',
            'Durata': '5 anni'
        }
    };
}

// Calcolo B.7 - Microcogenerazione
function calcolaB7() {
    const potenzaElettrica = parseFloat(document.getElementById('potenzaElettrica').value);
    const potenzaTermica = parseFloat(document.getElementById('potenzaTermica').value);
    const pes = parseFloat(document.getElementById('pes').value);
    const spesaTotale = parseFloat(document.getElementById('spesaTotale').value);
    const sostituzioneImpianto = document.getElementById('sostituzioneImpianto').checked;
    const fontiRinnovabiliEsclusive = document.getElementById('fontiRinnovabiliEsclusive').checked;

    if (!sostituzioneImpianto || !fontiRinnovabiliEsclusive) {
        throw new Error('Tutti i requisiti obbligatori devono essere soddisfatti');
    }

    if (potenzaElettrica >= 50) {
        throw new Error('Potenza elettrica deve essere inferiore a 50 kWe');
    }

    if (pes < 10) {
        throw new Error('PES (Risparmio Energetico Primario) deve essere almeno 10%');
    }

    // Calcolo semplificato: 65% della spesa
    const incentivoTeorico = 0.65 * spesaTotale;
    const massimale = getMassimaleSoggetto();
    const limiteMassimale = spesaTotale * massimale.percentuale;
    const incentivoFinale = Math.min(incentivoTeorico, limiteMassimale);

    return {
        tipo: 'B.7 - Microcogenerazione da Fonti Rinnovabili',
        incentivoTeorico: incentivoTeorico,
        incentivoFinale: incentivoFinale,
        vincoloApplicato: '65% spesa sostenuta',
        durataAnni: 5,
        rataAnnuale: incentivoFinale / 5,
        requisitiOK: sostituzioneImpianto && fontiRinnovabiliEsclusive && potenzaElettrica < 50 && pes >= 10,
        dettagli: {
            'Potenza elettrica': potenzaElettrica.toFixed(1) + ' kWe (max: 50)',
            'Potenza termica': potenzaTermica.toFixed(1) + ' kWt',
            'PES': pes.toFixed(1) + '% (min: 10%)',
            'Spesa totale': spesaTotale.toFixed(2) + ' €',
            'Durata': '5 anni'
        },
        warning: 'Alimentazione esclusiva da fonti rinnovabili. Risparmio energetico primario (PES) ≥ 10%.'
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

    // Aggiungi warning specifico se presente
    if (risultato.warning) {
        html += `
            <div class="warning">
                <strong>Attenzione:</strong> ${risultato.warning}
            </div>
        `;
    }

    // Requisiti tecnici soddisfatti
    if (risultato.requisitiOK !== undefined) {
        if (risultato.requisitiOK) {
            html += `
                <div class="info">
                    ✓ Requisiti tecnici soddisfatti
                </div>
            `;
        } else {
            html += `
                <div class="warning">
                    ✗ Alcuni requisiti tecnici non sono soddisfatti. Verificare i valori inseriti.
                </div>
            `;
        }
    }

    // Nota erogazione unica rata
    if (risultato.incentivoFinale <= 15000) {
        html += `
            <div class="info">
                Per soggetti privati, l'incentivo può essere erogato in unica rata (importo ≤ 15.000 €).
            </div>
        `;
    }

    // Se presente intervento abbinato, mostralo
    if (risultato.interventoAbbinato) {
        const abb = risultato.interventoAbbinato;
        html += `
            <div style="margin-top: 30px; padding-top: 30px; border-top: 3px solid #00A19C;">
                <div class="result-highlight" style="background: linear-gradient(135deg, #006B68 0%, #008E89 100%);">
                    <h3>Intervento Abbinato</h3>
                    <div class="amount">${abb.incentivoFinale.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €</div>
                </div>

                <div class="details-box">
                    <h4>${abb.tipo}</h4>
                    <div class="result-item">
                        <span class="result-label">Incentivo teorico:</span>
                        <span class="result-value">${abb.incentivoTeorico.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Incentivo finale:</span>
                        <span class="result-value">${abb.incentivoFinale.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Vincolo applicato:</span>
                        <span class="result-value">${abb.vincoloApplicato}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Durata incentivo:</span>
                        <span class="result-value">${abb.durataAnni} anni</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Rata annuale:</span>
                        <span class="result-value">${abb.rataAnnuale.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €</span>
                    </div>
                </div>

                <div class="details-box">
                    <h4>Dettagli Intervento Abbinato</h4>
        `;

        for (const [chiave, valore] of Object.entries(abb.dettagli)) {
            html += `
                <div class="result-item">
                    <span class="result-label">${chiave}:</span>
                    <span class="result-value">${valore}</span>
                </div>
            `;
        }

        html += `</div>`;

        // Riepilogo totale multi-intervento
        const totaleIncentivi = risultato.incentivoFinale + abb.incentivoFinale;
        html += `
            <div class="result-highlight" style="margin-top: 20px; background: linear-gradient(135deg, #2C3E50 0%, #1A252F 100%);">
                <h3>TOTALE INCENTIVI (Multi-Intervento)</h3>
                <div class="amount">${totaleIncentivi.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €</div>
                <p style="font-size: 0.9em; margin-top: 10px; opacity: 0.9;">
                    ${risultato.tipo}: ${risultato.incentivoFinale.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})} € +
                    ${abb.tipo}: ${abb.incentivoFinale.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €
                </p>
            </div>
        `;

        html += `</div>`;
    }

    risultatiDettaglio.innerHTML = html;
    resultsSection.style.display = 'block';

    // Scroll ai risultati
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
