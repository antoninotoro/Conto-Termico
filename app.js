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

        <div class="warning">
            <strong>Requisiti Obbligatori:</strong> Intervento su strutture opache esistenti.
            Necessaria Diagnosi Energetica preventiva e APE post-intervento.
        </div>

        <div class="form-group">
            <label>Tipo di Struttura:</label>
            <select id="tipoStruttura">
                <option value="coperture">Coperture</option>
                <option value="pavimenti">Pavimenti</option>
                <option value="pareti">Pareti verticali</option>
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
                <label>Trasmittanza U post-intervento (W/m²K):</label>
                <input type="number" id="trasmittanza" min="0" step="0.01" required>
                <small id="trasmittanza-info" class="info-text"></small>
            </div>
            <div class="form-group">
                <label>Superficie oggetto intervento (m²):</label>
                <input type="number" id="superficie" min="0" step="0.01" required>
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Costo specifico sostenuto (€/m²):</label>
                <input type="number" id="costoSpecifico" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Spesa totale sostenuta (€):</label>
                <input type="number" id="spesaTotale" min="0" step="0.01" required>
            </div>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="isolamentoInterno">
            <label for="isolamentoInterno">Isolamento interno o in intercapedine (trasmittanza +30%)</label>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="multiIntervento">
            <label for="multiIntervento">Multi-intervento con Art. 8 (maggiorazione 55%)</label>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="prodottoUE">
            <label for="prodottoUE">Componenti prodotti in UE (+10%)</label>
        </div>

        <script>
            document.getElementById('zonaClimatica').addEventListener('change', updateTrasmittanzaInfo);
            document.getElementById('tipoStruttura').addEventListener('change', updateTrasmittanzaInfo);
            document.getElementById('isolamentoInterno').addEventListener('change', updateTrasmittanzaInfo);
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
            <label>Zona Climatica:</label>
            <select id="zonaClimatica">
                ${ZONE_CLIMATICHE.map(z => `<option value="${z}">${z}</option>`).join('')}
            </select>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Trasmittanza U finestre (W/m²K):</label>
                <input type="number" id="trasmittanza" min="0" step="0.01" required>
                <small id="trasmittanza-info" class="info-text"></small>
            </div>
            <div class="form-group">
                <label>Superficie oggetto intervento (m²):</label>
                <input type="number" id="superficie" min="0" step="0.01" required>
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Costo specifico sostenuto (€/m²):</label>
                <input type="number" id="costoSpecifico" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Spesa totale sostenuta (€):</label>
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

// Form A.3 - Trasformazione NZEB
function getFormA3() {
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
            <input type="checkbox" id="certificazioneNZEB" required>
            <label for="certificazioneNZEB">APE certifica edificio come NZEB (obbligatorio)</label>
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

        <div class="info">
            <strong>Requisito Tecnico:</strong> Il sistema deve appartenere almeno alla Classe B della
            Norma UNI EN ISO 52120-1.
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
            <input type="checkbox" id="classeB" required>
            <label for="classeB">Sistema Classe B o superiore (UNI EN ISO 52120-1) - Obbligatorio</label>
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
                <label>Potenza Fotovoltaico (kW):</label>
                <input type="number" id="potenzaFV" min="2" max="1000" step="0.01" required>
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

        <div class="checkbox-group">
            <input type="checkbox" id="certificazioneCE" required>
            <label for="certificazioneCE">Moduli e Inverter certificati CE (obbligatorio)</label>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="garanziaModuli" required>
            <label for="garanziaModuli">Garanzia moduli 90% dopo 10 anni (obbligatorio)</label>
        </div>
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
            <label>Tipologia Pompa di Calore:</label>
            <select id="tipoPDC">
                <option value="aria-acqua_BT">Aria-Acqua Bassa Temperatura</option>
                <option value="aria-acqua_MT">Aria-Acqua Media Temperatura</option>
                <option value="acqua-acqua">Acqua-Acqua</option>
                <option value="gas">Pompa a Gas</option>
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
                <label>Potenza nominale (kW):</label>
                <input type="number" id="potenza" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label id="labelSCOP">SCOP (Coefficiente Prestazione Stagionale):</label>
                <input type="number" id="scop" min="0" step="0.01" required>
                <small id="scop-info" class="info-text"></small>
            </div>
        </div>

        <div class="form-group">
            <label>Efficienza energetica riscaldamento stagionale ηs (%):</label>
            <input type="number" id="eta_s" min="0" step="1" required>
            <small id="eta-info" class="info-text"></small>
        </div>

        <div class="form-group">
            <label>Spesa totale sostenuta (€):</label>
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
                <label>SCOP Pompa di Calore:</label>
                <input type="number" id="scop" min="3.1" step="0.01" required>
                <small class="info-text" style="color: #006B68;">Valore minimo: 3.1 (media temp.)</small>
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Efficienza stagionale caldaia ηs (%):</label>
                <input type="number" id="eta_caldaia" min="90" step="1" required>
                <small class="info-text" style="color: #006B68;">Valore minimo: 90%</small>
            </div>
            <div class="form-group">
                <label>Spesa totale sostenuta (€):</label>
                <input type="number" id="spesaTotale" min="0" step="0.01" required>
            </div>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="caldaiaCondensazione" required>
            <label for="caldaiaCondensazione">Caldaia a condensazione (obbligatorio)</label>
        </div>
    `;
}

// Form B.3 - Scaldacqua a Pompa di Calore
function getFormB3() {
    return `
        <h3>B.3 - Scaldacqua a Pompa di Calore</h3>

        <div class="info">
            <strong>Requisito:</strong> Appartenenza alla classe di efficienza energetica A o superiore
            (Regolamento UE 812/2013).
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Classe Energetica:</label>
                <select id="classeEnergetica">
                    <option value="A">Classe A</option>
                    <option value="A+">Classe A+</option>
                    <option value="A++">Classe A++</option>
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

        <div class="checkbox-group">
            <input type="checkbox" id="sostituzioneScaldacqua" required>
            <label for="sostituzioneScaldacqua">Sostituzione di scaldacqua elettrico/gas (obbligatorio)</label>
        </div>
    `;
}

// Form B.4 - Allaccio a Teleriscaldamento
function getFormB4() {
    return `
        <h3>B.4 - Allaccio a Teleriscaldamento Efficiente</h3>

        <div class="warning">
            <strong>Requisito Obbligatorio:</strong> L'allaccio deve ricadere nelle reti di teleriscaldamento
            efficienti censite nell'Anagrafica territoriale teleriscaldamento e teleraffrescamento istituita da ARERA.
        </div>

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
            'Limite 65%': limite65.toFixed(2) + ' €'
        },
        warning: 'Ricorda: Diagnosi Energetica preventiva e APE post-intervento sono obbligatori.'
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
        requisitiOK: certificazioneNZEB,
        dettagli: {
            'Zona Climatica': zonaClimatica,
            'Superficie edificio': superficie.toFixed(2) + ' m²',
            'Costo specifico sostenuto': costoSpecifico.toFixed(2) + ' €/m²',
            'Costo massimo ammissibile': Cmax.toFixed(2) + ' €/m²',
            'Costo utilizzato': costoAmmissibile.toFixed(2) + ' €/m²',
            'Spesa totale': spesaTotale.toFixed(2) + ' €',
            '% spesa applicata': (percSpesa * 100).toFixed(0) + '%',
            'Limite 65%': limite65.toFixed(2) + ' €'
        },
        warning: 'Intervento ammesso solo con ristrutturazione edilizia o demolizione/ricostruzione. APE NZEB e Diagnosi Energetica obbligatori.'
    };
}

// Calcolo A.4 - Building Automation
function calcolaA4() {
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
        requisitiOK: classeB,
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
    const certificazioneCE = document.getElementById('certificazioneCE').checked;
    const garanziaModuli = document.getElementById('garanziaModuli').checked;

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
        requisitiOK: certificazioneCE && garanziaModuli && potenzaFV >= 2 && potenzaFV <= 1000,
        dettagli: {
            'Potenza FV': potenzaFV.toFixed(2) + ' kW',
            'Spesa FV': spesaFV.toFixed(2) + ' €',
            'Costo max FV': CmaxFV.toFixed(2) + ' €/kW',
            'Incentivo FV': incentivoFV.toFixed(2) + ' €',
            'Capacità Accumulo': capacitaAccumulo.toFixed(2) + ' kWh',
            'Spesa Accumulo': spesaAccumulo.toFixed(2) + ' €',
            'Incentivo Accumulo': incentivoAccumulo.toFixed(2) + ' €',
            'Incentivo PC abbinata': incentivoPC.toFixed(2) + ' €'
        },
        warning: 'Deve essere abbinato a sostituzione impianto con pompa di calore elettrica. Assetto in autoconsumo.'
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
            'Limite 65%': limite65.toFixed(2) + ' €',
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

// Calcolo B.4 - Allaccio a Teleriscaldamento
function calcolaB4() {
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
        requisitiOK: reteEfficiente && sostituzioneImpianto,
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

    risultatiDettaglio.innerHTML = html;
    resultsSection.style.display = 'block';

    // Scroll ai risultati
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
