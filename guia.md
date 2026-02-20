# Guia de l'activitat

## 🎯Objectius clau

- Instal·lar CA a Windows Server 2025.
- Habilitar inscripció web (IIS).
- Generar certificats d'usuari.
- Signar i verificar un PDF.

## 📋Requisits

- VM Windows Server 2025 (adaptador pont).
- VM Client Windows 10/11 (adaptador pont).
- Adobe Acrobat Reader instal·lat al client.
- Treball en Parelles (Admin/Client).

## Configuracions inicials

1. Instal·lar Windows Server 2025 i Windows 11 a les VMs. Configurar adaptadors de xarxa en mode pont per accés directe.

2. Inicialment, el servidor no se li assignarà cap IP, fins que prèviament pausem les actualitzacions.

3. Un cop ja ho tinguem tot instal·lat, el primer que farem serà configurar una IP estàtica al servidor i client amb el següent esquema:

    | Grup-classe | IP          | Mascara       | Gateway       | DNS     |
    |-------------|-------------|---------------|---------------|---------|
    | A           | 192.168.2.x | 255.255.255.0 | 192.168.2.254 | 8.8.8.8 |
    | B           | 192.168.4.x | 255.255.255.0 | 192.168.4.254 | 8.8.8.8 |

4. Canviar el nom del servidor a SRV-CA-0X on X és el número del vostre grup.

## Fase 1: Instal·lació de ka CA Arrel — [Rol: Administrador del Servidor]

1. Obriu l'Administrador del Servidor (Server Manager) al servidor i afegiu el rol d'Active Directory Certificate Services (AD CS).
2. Durant la selecció de serveis de rol, marqueu només Certification Authority. Completa la instal·lació.
3. Inicieu la configuració post-instal·lació (bandera de notificacions) i configureu la CA amb els següents paràmetres:
4. Tipus d'instal·lació: Standalone CA (CA Independent).
5. Tipus de CA: Root CA (CA Arrel).
6. Clau privada: Creeu una nova clau privada amb una longitud de 4096 bits.
7. Nom de la CA: NexusX-Root-CA (on X és el número del vostre grup).
8. Període de validesa: 5 anys.

## Fase 2: Generació d'un certificat SSL per al portal web — [Rol: Administrador del Servidor]

1. Obriu el PowerShell com a administrador i creeu una carpeta temporal (ex. C:\temp).
2. Creeu un fitxer anomenat servercert.inf utilitzant el Bloc de Notes amb la següent configuració (adapteu el nom del vostre servidor si és diferent a SRV-CA-01):

```text
[Version]
Signature="$Windows NT$"
[NewRequest]
Subject="CN=ca.nexus.test"
KeyLength=2048
KeySpec=1
KeyUsage=0x40
MachineKeySet=TRUE
ProviderName="Microsoft RSA SChannel Cryptographic Provider"
RequestType=PKCS10
FriendlyName="Certificat Web Nexus"
[EnhancedKeyUsageExtension]
OID=1.3.6.1.5.5.7.3.1
[Extensions]
2.5.29.17="{text}"
_continue="dns=ca.nexus.test&"
_continue="dns=SRV-CA-01"
```

3. Genereu la petició de certificat executant: certreq -new C:\temp\servercert.inf C:\temp\servercert.req
4. Envieu la petició a la CA: certreq -submit -attrib "CertificateTemplate:WebServer" C:\temp\servercert.req C:\temp\servercert.cer. Us demanarà seleccionar la vostra CA.
5. Obriu la consola de l'Autoritat de Certificació, aneu a Pending Requests (Peticions pendents), feu clic dret sobre la vostra petició i seleccioneu Issue (Emetre).
6. Recupereu el certificat (substituïu el '2' per l'ID correcte de la vostra petició): certreq -retrieve 2 C:\temp\servercert_issued.cer
7. Instal·leu el certificat al servidor: certreq -accept C:\temp\servercert_issued.cer

## Fase 3: Instal·lació del Portal Web i IIS — [Rol: Administrador del Servidor]

1. Obriu l'Administrador de l'IIS (Internet Information Services).
2. Aneu a "Default Web Site", seleccioneu Bindings (Enllaços) i afegiu-ne un de nou del tipus https al port 443.
3. Seleccioneu el certificat SSL que heu instal·lat a la Fase 2 ("Certificat Web Nexus").
4. Des del navegador del propi servidor, comproveu que podeu accedir a: https://localhost/certsrv.

## Fase 4: Configuració de l'IIS i posada en marxa — [Rol: Administrador del Servidor]

1. Obriu l'Administrador de l'IIS (Internet Information Services).
1. Aneu a "Default Web Site", seleccioneu Bindings (Enllaços) i afegiu-ne un de nou del tipus https al port 443.
1. Seleccioneu el certificat SSL que heu instal·lat a la Fase 2 ("Certificat Web Nexus").
1. Des del navegador del propi servidor, comproveu que podeu accedir a: https://ca.nexus.test/certsrv.

## Fase 5: Sol·licitud des d'un client — [Rols Combinats]

