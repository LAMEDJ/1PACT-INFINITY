# Connecter 1pact.fr à Vercel

Pour que **1pact.fr** affiche ton site (au lieu de frontend-self-kappa-74.vercel.app), il faut ajouter un enregistrement DNS chez le fournisseur de ton domaine (OVH, Gandi, etc.).

## Étape unique : enregistrement A

Chez ton fournisseur de domaine (là où tu as acheté **1pact.fr**), ajoute un enregistrement DNS :

| Champ   | Valeur        |
|--------|----------------|
| **Type**  | `A`            |
| **Nom**   | `@` (ou la racine du domaine) |
| **Valeur**| `216.198.79.1` |

- **@** = le domaine principal (1pact.fr).
- Si on te demande un sous-domaine, laisse vide ou mets `@`.
- Supprime tout autre enregistrement **A** ou **AAAA** sur `@` s’il entre en conflit.

## Où le faire (exemples)

- **OVH** : Espace client → Noms de domaine → 1pact.fr → Zone DNS → Ajouter une entrée (Type A, Sous-domaine vide ou @, Cible 216.198.79.1).
- **Gandi** : Domaines → 1pact.fr → Enregistrements DNS → Ajouter (Type A, Nom @, Valeur 216.198.79.1).
- **Autre** : Cherche "DNS" ou "Zone DNS" ou "Gestion des enregistrements" pour 1pact.fr.

## Après avoir enregistré

- La propagation DNS peut prendre **quelques minutes à 48 h**.
- Sur Vercel, onglet **Domaines** : quand c’est bon, 1pact.fr passera en "Configuration valide" (coche verte).
- Tu pourras alors ouvrir **https://1pact.fr** et voir ton site.

## En résumé

1. Ouvre le site de ton fournisseur de domaine (1pact.fr).
2. Va dans la gestion DNS / zone DNS.
3. Ajoute : Type **A**, Nom **@**, Valeur **216.198.79.1**.
4. Enregistre et attends la propagation (Vercel se met à jour tout seul).
