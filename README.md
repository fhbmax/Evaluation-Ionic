#Evaluation-Ionic

## Über das Projekt 

Dies ist eine Client-App für das in der Entwicklung befindliche System zur Evaluation der Lehre an der [TH Brandenburg](http://www.th-brandenburg.de). Sie ist eine *Cross-Platform-*Adaption der [Android-App](https://github.com/TH-Brandenburg/University-Evaluation-Android) und arbeitet mit der REST-API des [Backend-Servers](https://github.com/TH-Brandenburg/University-Evaluation-Backend). 

Im Intranet der TH Brandenburg kann die Anwendung als Web-App unter [https://evaluation.th-brandenburg.de/webapp](https://evaluation.th-brandenburg.de/webapp) aufgerufen werden.


## Kompilierung 

Um dieses Projekt als Web-App oder Hybrid-App (für Android, iOS, Windows UWP) zu kompilieren, müssen die folgenden Entwicklungsabhängigkeiten installiert sein.

1. Node.js
[Node.js](https://nodejs.org/en/) (v6.x.x LTS, neuere könnten auch funktionieren)

2. Ionic und Cordova

Über den *Node Package Manager* global installieren:

    npm install -g cordova ionic

3. Weitere Abhängigkeiten dieses Projektes

Alle Entwicklungsabhängigkeiten im Projektverzeichnis automatisch herunterladen und installieren:

    npm install
(im obersten Verzeichnis ausführen, wo auch die *package.json*-Datei liegt)

### Web-App
Das Projekt sollte jetzt als Web-App kompiliert werden können. Über den Befehl

    ionic serve 

wird sie kompiliert und mit einem lokalen Webserver gehostet.

[http://localhost:8100](http://localhost:8100)

### Android-App
Um die Android-App (apk) zu kompilieren, muss das [https://developer.android.com/studio/index.html#downloads](Android-SDK) installiert sein. 

Befehle zum Kompilieren und Ausführen auf einem per ADB angeschlossenen Gerät:
    ionic build android 

    ionic run android --device 

### iOS-App 
Für iOS-Builds muss Xcode 7 oder höher installiert und ein *Provisioning Profile* angelegt sein.
Detailierte Anleitung in der [http://ionicframework.com/docs/intro/deploying/](Ionic Documentation).

