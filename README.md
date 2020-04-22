# PSP Generator
Ein Baum-Generator-Tool basierend auf Text-Einrückungen für einfache Projektstruktur-Pläne und Ähnliches (OSP, PSP, BOP, usw).

Hier ausprobieren: [PSP Generator](https://tryops.github.io/psp-generator/)

![Screenshot](res/screenshot.png)

## PSP aufbauen
Mit Tabs den PSP im Textfeld aufbauen oder hineinkopieren. Wichtig: Es müssen Tabs sein, keine Spaces.
- Zeilen mit `//` werden ignoriert (Kommentare).
- Knoten/Boxen werden als Meilensteine dargestellt, wenn der Text mit `<>` beginnt (z.B. `<> Planung abgenommen`).
- Leere Zeilen sind erlaubt.

## PSP generieren
Mit dem **GENERATE** Button wird der PSP generiert, bei Änderungen am PSP am besten immer neu generieren (ist nicht automatisch). Der Graph ist interaktiv, es lässt sich zoomen und verschieben, blaube Boxen lassen sich mit Klicken ausklappen, weiße sind bereits ausgeklappt.
Falls Boxen zu eng aneinander liegen lassen sich bei der Seitenleiste beliebige Anpassungen vornehmen (Größe, Abstand, keine Box, zentrierter Text, usw.). 
Der PSP-Code wird automatisch für jede Box generiert (deaktivierbar). 

## PSP exportieren
### PNG exportieren
Zum Schluss ganz hinaus zoomen (der ganze PSP muss sichtbar sein) und als PNG exportieren (**EXPORT PNG**).
  - Als Upscale-Faktor einen passenden Wert wählen, sodass das Bild nicht verpixelt ist (ausprobieren). 
  - Exportieren! (_kann eine Weile dauern je nachdem wie groß das Bild ist_)

### Link erstellen
Es lassen sich auch Links für einen PSP erstellen (**CREATE LINK**). Wird ein Link aufgerufen, wird der verlinkte PSP wiederhergestellt, jedoch nur die Struktur (nicht z.B. alles ausgeklappte). 
Dadurch kann man den PSP später nochmals interaktiv ansehen. 
Das Textfeld kann hierfür auch "ausgeblendet" werden (an der rechten unteren Ecke das Textfeld ganz nach links ziehen). 


## Ähnlich
Inspiriert von 
- [Text2MindMap](https://tobloef.com/text2mindmap/)
- [draw.io](https://app.diagrams.net/)
