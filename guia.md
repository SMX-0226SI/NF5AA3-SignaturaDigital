# Guia de l'activitat

## Fase 1: Preparació de l'entorn de laboratori

1. Instal·lar Ubuntu Server i Windows 11 a les VMs. Configurar adaptadors de xarxa en mode pont per accés directe.
1. Inicialment, el client no se li assignarà cap IP, fins que prèviament pausem les actualitzacions.
1. Un cop ja ho tinguem tot instal·lat, el primer que farem serà configurar una IP estàtica al servidor i client amb el següent esquema:

    | Grup-classe | IP          | Mascara       | Gateway       | DNS     |
    |-------------|-------------|---------------|---------------|---------|
    | A           | 192.168.2.y | 255.255.255.0 | 192.168.2.254 | 8.8.8.8 |
    | B           | 192.168.4.y | 255.255.255.0 | 192.168.4.254 | 8.8.8.8 |

   > On y correspon al vostre número de llista (recordeu que un instal·la el Server i l'altre el Windows 11)

1. Canviar el nom del servidor a **ca.nexusX.test** on X és el número del vostre grup.
1. Configurar en el client l'arxiu de hosts per resoldre el nom del servei web (ca.nexusX.test) a la seva IP corresponent.

> **Important**: És molt aconsellable crear instantànies (snapshots) d'ambdues màquines abans d'iniciar la pràctica per permetre la reversió de l'estat dels sistemes un cop finalitzada l'activitat

## Fase 2: Creació de l'Entitat de Certificació (CA)

1. Editar l'arxiu de configuració de OpenSSL (`/etc/ssl/openssl.cnf`) per configurar la CA. Afegir una secció específica per a la CA corporativa:

    ``` text
    [ca]
    default_ca = CA_default

    [CA_default]
    dir               = /etc/ssl/CA
    certs             = $dir/certs
    crl_dir           = $dir/crl
    database          = $dir/index.txt

    ...    

1. Crear l'estructura de directoris per a la CA i inicialitzar els fitxers necessaris:

    ``` bash
    sudo mkdir -p /etc/ssl/CA/{certs,crl,newcerts,private}
    sudo touch /etc/ssl/CA/index.txt
    sudo echo 001 > /etc/ssl/CA/serial
    ```

1. Ara, generarem la clau privada de la CA i el certificat d'autoritat:

    ``` bash
    sudo openssl genpkey -algorithm RSA -out /etc/ssl/CA/private/ca.key.pem -aes256
    sudo openssl req -x509 -new -nodes -key /etc/ssl/CA/private/ca.key.pem -sha256 -days 3650 -out /etc/ssl/CA/certs/ca.cert.pem
    ```

    Per donar identitat a la CA, usarem com `Organization Name` el nom de la organització (ex: Nexus 1, Nexus 2, etc.) i com `Common Name` el nom del servidor (ex: ca.nexusX.test) on `X` és el número del vostre grup.

## Fase 3: Generació de la clau i certificat d'usuari

1. Simuleu l'emissió del certificat d'usuari directament des del servidor. Genereu una clau privada per a l'usuari (assigneu un PIN).

1. Signeu aquesta sol·licitud amb la clau privada de la vostra CA acabada de crear.

1. A continuació, exporteu i convertiu el certificat a format PKCS#12 (amb extensió .pfx), el format estàndard per a la instal·lació als equips clients.

1. Assigneu una contrasenya d'exportació, ja que serà necessària perquè l'usuari la introdueixi al seu equip més endavant.

## Fase 4: Distribució de Certificats (Servidor - Client)

L'usuari ha de rebre tant el certificat de la CA com el seu certificat personal. Proposem dues alternatives per a l'empresa:

- **Mètode 1 (Bàsic)**: Ús del protocol SCP.

  - Per facilitar la transferència, copieu tant el certificat arrel com el certificat d'usuari al directori accessible al client, i configureu els permisos adients als fitxers (per exemple, `chmod 777 CertUser.pfx`).
  - Instal·leu el servei SSH al servidor Ubuntu (apt install ssh). Al client Windows, obriu un intèrpret de comandes (PowerShell) i executeu les comandes scp amb la IP del servidor per descarregar `cacert.pem` i el certificat `.pfx`.

- **Mètode 2 (Avançat - Portal d'empleat)**: Instal·leu un servidor web com Apache o Nginx a l'Ubuntu. Creeu una senzilla pàgina HTML corporativa "Portal de Certificats" amb enllaços de descàrrega cap als dos fitxers. L'usuari des del Windows només haurà d'entrar a la IP del servidor pel navegador web i fer clic per descarregar-los, una solució molt més propera al món real.

## Fase 5: Instal·lació de Certificats al Client

1. Obriu un terminal amb privilegis d'administrador al client Windows i instal·leu el programari de lectura PDF mitjançant el gestor de paquets Winget: `winget install Adobe.Acrobat.Reader.64-bit --accept-source-agreements --accept-package-agreements`.

1. Executeu la consola d'administració de certificats amb la comanda certmgr.msc.

1. A la branca d'Entitats de confiança arrel, importeu el certificat del servidor (cacert.pem) perquè el sistema operatiu reconegui la vostra pròpia CA com a segura.

1. Seguidament, a la secció Personal, importeu el certificat d'usuari i introduïu la clau de protecció que vau establir al servidor durant l'exportació.

## Fase 6: Signatura Digital d'un Document PDF

1. Creeu un document PDF qualsevol (una factura simulada de la vostra empresa cap al client) i obriu-lo amb Adobe Acrobat Reader.

1. Dins l'apartat de "Totes les eines", accediu a "Usar un Certificat" i premeu "Signar".

1. Dibuixeu l'àrea on s'aplicarà la signatura i trieu el vostre certificat recentment instal·lat a la finestra desplegable. * Deseu i bloquegeu el document (si així ho desitgeu). Finalment, obriu de nou el PDF per verificar que el panell de signatures valida l'autoria sense errors, confirmant que tot el procés criptogràfic funciona correctament.
