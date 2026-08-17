# NF5AA3. Infraestructura de clau pública (PKI) i signatura digital

## Presentació de l'activitat

En aquesta activitat, es desenvoluparà una infraestructura de clau pública (PKI) corporativa i es realitzarà la signatura digital d'un document. La PKI és un conjunt de rols, polítiques, hardware, software i procediments necessaris per crear, gestionar, distribuir, utilitzar, emmagatzemar i revocar certificats digitals i gestionar la criptografia de clau pública.

### Durada de l'activitat

Durada aproximada: 4 hores.

### Objectius de l'activitat

- Instal·lar CA a Ubuntu Server.
- Generar certificats d'usuari.
- Signar i verificar un PDF.

### Competències treballades

p) Aplicar els protocols i normes de seguretat, qualitat i respecte al medi ambient en les intervencions realitzades.

### Resultats d'aprenentatge i criteris d'avaluació

RA4. Assegura la privadesa de la informació transmesa en xarxes informàtiques descrivint vulnerabilitats i instal·lant programari específic.

4.6 Descriu sistemes d'identificació com la signatura electrònica, certificat digital, entre altres.
4.7 Utilitza sistemes d'identificació com la signatura electrònica, certificat digital, entre altres.

### Continguts

4.5 Sistemes d'identificació: signatura electrònica, certificats digitals i altres.

### Capacitats clau

|             |                         |                    |
|------       |---------                |----------          |
|Autonomia    |Organització del treball |Treball en equip    |
|~~Innovació~~|Resolució de problemes   |Responsabilitat     |
|             |Relació interpersonal    |                    |

## Enunciat de l'activitat

### Entorn de treball

- És una activitat en parelles.
- VM Servidor Ubuntu Server (adaptador1: NAT/adaptador 2: pont).
- VM Client Windows 10/11 (adaptador1: NAT/adaptador 2: pont).
- Adobe Acrobat Reader instal·lat al client.

Configuració adreces:

- Adaptador NAT: DHCP (per accés a Internet).
- Adaptador pont: IP estàtica 192.168.2.x (2n A) i 192.168.4.x (2n B) segons el vostre número de llista.

> **Nota**: és una activitat pensada per fer en parelles, si algun alumne la fa sol, podeu simplement podeu canviar la interfície de pont a només-amfitrió (host-only) amb assingnació DHCP.

### Instruccions de l'activitat

Els usuaris necessiten un certificat digital per poder la seva assegurar la seva identitat a la xarxa, sigui per accedir de forma segura a un servei web, per signar un document PDF o per xifrar correus electrònics.

Un certificat que ha de ser generat per una autoritat de certificació (CA) que garanteixi la identitat del titular del certificat, tal com s'ha explicat a la teoria, aquestes autoritats poden ser organismes públics o organitzacions privades com Comodo o Symantec. Encara que qualsevol organització pot crear la seva pròpia CA, en aquest cas, es crearà una CA corporativa per a l'empresa fictícia `Nexus`.

Una CA corporativa partirà d'un certificat signat per una entitat certificadora reconeguda, però en el cas de l'activitat, la CA corporativa serà autogestionada i per tant, es partirà d'un certificat arrel creat per l'empresa fictícia.

Descripció completa de l'activitat està disponible a la [guia de l'activitat](guia.md).

### Documentació i informe final

Redactar una guia tècnica en format `Markdown` que detalli els passos seguits per a la implementació de la PKI i la signatura digital. Aquesta guia ha de ser clara i ben estructurada, pensada per guiar de forma efectiva altres tècnics per desplegar la solució. Ha d'incloure les captures significatives i les explicacions i indicacions necessàries per a cada pas realitzat. Especialment, pareu atenció a documentar el final de cada fase: certificat creat, instal·lació certificat arrel, PDF signat, etc.

A més de la guia, caldrà incorporar els següents documents al repositori:

- El document PDF de prova (factura/contracte) signat digitalment pel client
- El certificat de l'entitat arrel.

Al ser un treball en equip, tots dos membres de l'equip lliuren la guia de forma conjunta. És molt important no limitar-se a dividir-se les tasques, cal que tots dos membres de l'equip coneguin i entenguin tot el procés, ja que caldrà fer una petita defensa oral del treball realitzat davant del professorat.

### Enllaços d'interès

- [JuncoTIC - PKI: ¿Qué es la infraestructura de clave pública?](https://juncotic.com/pki-que-es-la-infraestructura-de-clave-publica/)

- [MangoHost - How to Set Up and Configure a Certificate Authority (CA) on Ubuntu 24](https://mangohost.net/blog/how-to-set-up-and-configure-a-certificate-authority-ca-on-ubuntu-24/)

- [JuncoTIC - OpenSSL y certificados digitales – Práctica](https://juncotic.com/openssl-y-certificados-digitales-practica/)

- [FNTM - Firmar un documento PDF con Adobe Acrobat Reader (PDF)](https://www.sede.fnmt.gob.es/documents/10445900/10528353/Firmar_documento_PDF_Adobe_Acrobat_Reader_DC.pdf)
