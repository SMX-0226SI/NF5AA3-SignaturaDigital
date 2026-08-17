# Guia de l'activitat

## Fase 1: Preparació de l'entorn de laboratori

1. Instal·lar Ubuntu Server i Windows 11 a les VMs. Configurar dues interícies de xarxa, una en NAT (dhcp) per tenir accés a Internet i una segona perquè es puguin veure les dues màquines: pont (parelles) o només-amfitrió (individual).

2. La configuració de l'adaptador pont, ha de ser una IP estàtica al servidor i client amb el següent esquema:

    | Grup-classe | IP          | Mascara       | Gateway       | DNS     |
    |-------------|-------------|---------------|---------------|---------|
    | A           | 192.168.2.y | 255.255.255.0 |               |         |
    | B           | 192.168.4.y | 255.255.255.0 |               |         |

   > On y correspon al vostre número de llista (recordeu que un instal·la el Server i l'altre el Windows 11).
   >
   > **No posem ni gateway ni DNS perquè per sortir a Internet es fa servir l'adaptador en NAT.**

3. Canviar el nom del servidor a **ca.nexusX.test** on X és el número del vostre grup.

4. Configurar en el client l'arxiu de hosts per resoldre el nom del servei web (ca.nexusX.test) a la seva IP corresponent.

> **Important**: És molt aconsellable crear instantànies (snapshots) d'ambdues màquines abans d'iniciar la pràctica per permetre la reversió de l'estat dels sistemes un cop finalitzada l'activitat

## Fase 2: Creació de l'Entitat de Certificació (CA)

1. Editar l'arxiu de configuració de OpenSSL (`/etc/ssl/openssl.cnf`) per configurar la CA. Afegir una secció específica per a la CA corporativa:

    ``` plaintext
    [ca]
    default_ca = CA_default

    [CA_default]
    dir               = /etc/ssl/CA
    certs             = $dir/certs
    crl_dir           = $dir/crl
    database          = $dir/index.txt

    ```

2. Crear l'estructura de directoris per a la CA i inicialitzar els fitxers necessaris:

    ``` bash
    sudo mkdir -p /etc/ssl/CA/{certs,crl,newcerts,private}
    sudo touch /etc/ssl/CA/index.txt
    sudo echo "C001" > /etc/ssl/CA/serial
    ```

    > El serial en algunes versions d'OpenSSL dona error si comença per 0 [enllaç a issue](https://github.com/Icinga/icinga2/issues/5511). Per evitar en qualsevol cas l'error, el podem fer començar per una lletra com `C`.

3. Ara, generarem la clau privada de la CA i el certificat d'autoritat:

    ``` bash
    sudo openssl req -new -x509 -keyout /etc/ssl/CA/private/cakey.pem -out /etc/ssl/CA/cacert.pem
    ```

    Per donar identitat a la CA, usarem com `Organization Name` el nom de la organització (ex: Nexus 1, Nexus 2, etc.) i com `Common Name` el nom del servidor (ex: ca.nexusX.test) on `X` és el número del vostre grup.

## Fase 3: Generació de la clau i certificat d'usuari

1. Simuleu l'emissió del certificat d'usuari directament des del servidor. Genereu una clau privada per a l'usuari (podeu assignar un PIN que es requereixi cada cop que s'utilitzi, trieu per exemple *123456*).

    ``` bash
    openssl req -new -keyout userkey.pem -out userreq.csr
    ```

2. Signeu aquesta sol·licitud amb la clau privada de la vostra CA acabada de crear.

    ``` bash
    openssl ca -in userreq.csr -out usercert.pem
    ```

3. A continuació, exporteu i convertiu el certificat a format PKCS#12 (amb extensió .pfx), el format estàndard per a la instal·lació als equips clients.

    ``` bash
    openssl pkcs12 -export -out CertUser.pfx -inkey userkey.pem -in usercert.pem
    ```

4. Assigneu una contrasenya d'exportació, ja que serà necessària perquè l'usuari la introdueixi al seu equip més endavant.

## Fase 4: Distribució de Certificats (Servidor - Client)

L'usuari ha de rebre tant el certificat de la CA com el seu certificat personal. Per fer-ho, hi ha diverses opcions, en aquest cas, usarem el protocol SCP per transferir els fitxers des del servidor Ubuntu al client Windows.:

- Per facilitar la transferència, copieu tant el certificat arrel com el certificat d'usuari al directori accessible al client, i configureu els permisos adients als fitxers (per exemple, `chmod 777 CertUser.pfx`).

- Instal·leu el servei SSH al servidor Ubuntu (apt install ssh). Al client Windows, obriu un intèrpret de comandes (PowerShell) i executeu les comandes scp amb la IP del servidor per descarregar `cacert.pem` i el certificat `.pfx`.

## Fase 5: Instal·lació de Certificats al Client

1. Obriu un terminal amb privilegis d'administrador al client Windows i instal·leu el programari de lectura PDF mitjançant el gestor de paquets Winget: `winget install Adobe.Acrobat.Reader.64-bit --accept-source-agreements --accept-package-agreements`.

2. Executeu la consola d'administració de certificats amb la comanda certmgr.msc.

3. A la branca d'Entitats de confiança arrel, importeu el certificat del servidor (cacert.pem) perquè el sistema operatiu reconegui la vostra pròpia CA com a segura.

4. Seguidament, a la secció Personal, importeu el certificat d'usuari i introduïu la clau de protecció que vau establir al servidor durant l'exportació.

## Fase 6: Signatura Digital d'un Document PDF

1. Creeu un document PDF qualsevol (una factura simulada de la vostra empresa cap al client) i obriu-lo amb Adobe Acrobat Reader.

2. Dins l'apartat de `Totes les eines`, accediu a `Usar un Certificat` i premeu `Signar`.

3. Dibuixeu l'àrea on s'aplicarà la signatura i trieu el vostre certificat recentment instal·lat a la finestra desplegable. * Deseu i bloquegeu el document (si així ho desitgeu). Finalment, obriu de nou el PDF per verificar que el panell de signatures valida l'autoria sense errors, confirmant que tot el procés criptogràfic funciona correctament.
