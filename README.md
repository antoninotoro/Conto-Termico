# Calcolatore Incentivi Conto Termico 3.0

Applicazione web per il calcolo degli incentivi erogabili dal Conto Termico 3.0 per interventi di efficienza energetica e produzione di energia termica.

## Funzionalità

### Interventi di Efficienza Energetica (Art. 5)
- A.1 - Isolamento Termico (Superfici opache)
- A.2 - Sostituzione Chiusure Trasparenti
- A.3 - Trasformazione NZEB
- A.4 - Building Automation
- A.5 - Fotovoltaico e Accumulo

### Interventi di Produzione Energia Termica (Art. 8)
- B.1 - Pompe di Calore Elettriche
- B.2 - Sistemi Ibridi/Bivalenti
- B.3 - Scaldacqua a Pompa di Calore
- B.4 - Allaccio a Teleriscaldamento Efficiente

## Calcoli Implementati

L'applicazione calcola:
- Incentivo teorico in base ai parametri dell'intervento
- Applicazione automatica dei vincoli (Imax, 65% spesa)
- Maggiorazioni (zona climatica, multi-intervento, prodotti UE)
- Durata dell'incentivo e rate annuali
- Modalità di erogazione

## Come Utilizzare

1. Apri l'applicazione nel browser
2. Seleziona la tipologia di intervento
3. Inserisci i dati richiesti (superficie, potenza, costi, parametri di efficienza)
4. Clicca su "Calcola Incentivo"
5. Visualizza il risultato con tutti i dettagli del calcolo

## Tecnologie

- HTML5
- CSS3 (responsive design)
- JavaScript vanilla (nessuna dipendenza esterna)

## Note

I coefficienti di valorizzazione (Ci) e utilizzo (Quf) per le pompe di calore sono valori indicativi. Verificare sempre i valori ufficiali del decreto vigente per calcoli definitivi.

## Licenza

Questo calcolatore è basato sulle disposizioni del Decreto Conto Termico 3.0.
