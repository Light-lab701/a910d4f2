window.BRVM_RADAR_DATA = {
  meta: {
    asOfDate: "2026-05-27",
    updatedAt: "14h32",
    market: "BRVM",
    mode: "mock",
    kpis: {
      averageScore: 68.4
    },
    fluxDates: {
      prix: "2026-05-22",
      scoring: "2026-05-27",
      fondamentaux: "2026-05-24",
      actualites: "2026-05-25"
    }
  },
  signals: ["achat_fort", "achat", "neutre", "vente", "vente_forte"],
  companies: [
    {
      ticker: "CIEC",
      nom: "CIE COTE D'IVOIRE",
      secteur: "Services publics",
      pays: "Cote d'Ivoire",
      score: {
        date: "2026-05-27",
        global: 74.2,
        fondamental: 81,
        sentiment: 62,
        macro: 70,
        technique: 0,
        signal: "achat"
      },
      prix: {
        date: "2026-05-22",
        cloture: 2100,
        variation: 1.25,
        volume: 18420,
        capitalisation: 146000000000,
        source: "brvm.org"
      },
      fondamentaux: {
        annee: 2024,
        periode: "annuel",
        per: 8.6,
        price_book: 1.4,
        dividende: 120,
        rendement_div: 5.7,
        resultat_net: 18400000000,
        bpa: 264,
        capitaux_propres: 75000000000,
        nombre_actions: 69700000,
        valeur_comptable_action: 1076,
        roe: 24.5,
        p_cf: null
      },
      actualites: [
        {
          date: "2026-05-25",
          source: "BRVM",
          titre: "Publication des resultats annuels",
          sentiment: "positif",
          score_sent: 0.42
        }
      ],
      pipeline: {
        prix_ok: true,
        fondamentaux_ok: true,
        actualites_ok: true,
        scoring_ok: true,
        exclusion_reason: null
      }
    },
    {
      ticker: "SGBC",
      nom: "SOCIETE GENERALE COTE D'IVOIRE",
      secteur: "Finance",
      pays: "Cote d'Ivoire",
      score: {
        date: "2026-05-27",
        global: 82.5,
        fondamental: 88,
        sentiment: 71,
        macro: 76,
        technique: 0,
        signal: "achat_fort"
      },
      prix: {
        date: "2026-05-22",
        cloture: 15800,
        variation: 2.1,
        volume: 9200,
        capitalisation: 395000000000,
        source: "brvm.org"
      },
      fondamentaux: {
        annee: 2024,
        periode: "annuel",
        per: 6.9,
        price_book: 1.2,
        dividende: 1050,
        rendement_div: 6.6,
        resultat_net: 54200000000,
        bpa: 2168,
        capitaux_propres: 330000000000,
        nombre_actions: 25000000,
        valeur_comptable_action: 13200,
        roe: 16.4,
        p_cf: null
      },
      actualites: [
        {
          date: "2026-05-24",
          source: "Sika Finance",
          titre: "Hausse du produit net bancaire",
          sentiment: "positif",
          score_sent: 0.51
        }
      ],
      pipeline: {
        prix_ok: true,
        fondamentaux_ok: true,
        actualites_ok: true,
        scoring_ok: true,
        exclusion_reason: null
      }
    },
    {
      ticker: "BOABF",
      nom: "BANK OF AFRICA BURKINA FASO",
      secteur: "Finance",
      pays: "Burkina Faso",
      score: {
        date: "2026-05-27",
        global: 69.1,
        fondamental: 77,
        sentiment: 58,
        macro: 64,
        technique: 0,
        signal: "achat"
      },
      prix: {
        date: "2026-05-22",
        cloture: 6200,
        variation: 0.65,
        volume: 4120,
        capitalisation: 124000000000,
        source: "sikafinance.com"
      },
      fondamentaux: {
        annee: 2024,
        periode: "annuel",
        per: 7.8,
        price_book: 1.1,
        dividende: 410,
        rendement_div: 6.2,
        resultat_net: 22100000000
      },
      actualites: [
        {
          date: "2026-05-20",
          source: "BRVM",
          titre: "Avis de distribution de dividende",
          sentiment: "positif",
          score_sent: 0.31
        }
      ],
      pipeline: {
        prix_ok: true,
        fondamentaux_ok: true,
        actualites_ok: true,
        scoring_ok: true,
        exclusion_reason: null
      }
    },
    {
      ticker: "CBIBF",
      nom: "CORIS BANK INTERNATIONAL",
      secteur: "Finance",
      pays: "Burkina Faso",
      score: {
        date: "2026-05-27",
        global: 88.1,
        fondamental: 91,
        sentiment: 80,
        macro: 82,
        technique: 0,
        signal: "achat_fort"
      },
      prix: {
        date: "2026-05-22",
        cloture: 10350,
        variation: 1.8,
        volume: 11840,
        capitalisation: 310500000000,
        source: "brvm.org"
      },
      fondamentaux: {
        annee: 2024,
        periode: "annuel",
        per: 5.9,
        price_book: 1.6,
        dividende: 740,
        rendement_div: 7.1,
        resultat_net: 61800000000,
        bpa: 1236,
        capitaux_propres: 385000000000,
        nombre_actions: 50000000,
        valeur_comptable_action: 7700,
        roe: 16.1,
        p_cf: null
      },
      actualites: [
        {
          date: "2026-05-23",
          source: "BRVM",
          titre: "Resultats annuels en progression",
          sentiment: "positif",
          score_sent: 0.63
        }
      ],
      pipeline: {
        prix_ok: true,
        fondamentaux_ok: true,
        actualites_ok: true,
        scoring_ok: true,
        exclusion_reason: null
      }
    },
    {
      ticker: "NTLC",
      nom: "ONATEL BURKINA FASO",
      secteur: "Telecom",
      pays: "Burkina Faso",
      score: {
        date: "2026-05-27",
        global: 76.3,
        fondamental: 83,
        sentiment: 66,
        macro: 68,
        technique: 0,
        signal: "achat"
      },
      prix: {
        date: "2026-05-22",
        cloture: 4200,
        variation: 1.42,
        volume: 22150,
        capitalisation: 168000000000,
        source: "brvm.org"
      },
      fondamentaux: {
        annee: 2024,
        periode: "annuel",
        per: 7.2,
        price_book: 1.8,
        dividende: 300,
        rendement_div: 7.0,
        resultat_net: 36500000000
      },
      actualites: [
        {
          date: "2026-05-21",
          source: "Sika Finance",
          titre: "Trafic data en croissance sur le semestre",
          sentiment: "positif",
          score_sent: 0.28
        }
      ],
      pipeline: {
        prix_ok: true,
        fondamentaux_ok: true,
        actualites_ok: true,
        scoring_ok: true,
        exclusion_reason: null
      }
    },
    {
      ticker: "SNTS",
      nom: "SONATEL SENEGAL",
      secteur: "Telecom",
      pays: "Senegal",
      score: {
        date: "2026-05-27",
        global: 59.8,
        fondamental: 64,
        sentiment: 55,
        macro: 60,
        technique: 0,
        signal: "neutre"
      },
      prix: {
        date: "2026-05-22",
        cloture: 18500,
        variation: -0.35,
        volume: 15300,
        capitalisation: 1850000000000,
        source: "brvm.org"
      },
      fondamentaux: {
        annee: 2024,
        periode: "annuel",
        per: 11.4,
        price_book: 2.5,
        dividende: 1420,
        rendement_div: 7.6,
        resultat_net: 298000000000
      },
      actualites: [
        {
          date: "2026-05-17",
          source: "BRVM",
          titre: "Calendrier assemblee generale publie",
          sentiment: "neutre",
          score_sent: 0.04
        }
      ],
      pipeline: {
        prix_ok: true,
        fondamentaux_ok: true,
        actualites_ok: true,
        scoring_ok: true,
        exclusion_reason: null
      }
    },
    {
      ticker: "SIBC",
      nom: "SOCIETE IVOIRIENNE DE BANQUE",
      secteur: "Finance",
      pays: "Cote d'Ivoire",
      score: {
        date: "2026-05-27",
        global: 63.4,
        fondamental: 67,
        sentiment: 57,
        macro: 66,
        technique: 0,
        signal: "neutre"
      },
      prix: {
        date: "2026-05-22",
        cloture: 5300,
        variation: 0.0,
        volume: 3050,
        capitalisation: 159000000000,
        source: "sikafinance.com"
      },
      fondamentaux: {
        annee: 2024,
        periode: "annuel",
        per: 9.1,
        price_book: 1.3,
        dividende: 300,
        rendement_div: 5.6,
        resultat_net: 17900000000
      },
      actualites: [
        {
          date: "2026-05-19",
          source: "BRVM",
          titre: "Avis financier annuel disponible",
          sentiment: "neutre",
          score_sent: 0.02
        }
      ],
      pipeline: {
        prix_ok: true,
        fondamentaux_ok: true,
        actualites_ok: true,
        scoring_ok: true,
        exclusion_reason: null
      }
    },
    {
      ticker: "SDSC",
      nom: "SODE COTE D'IVOIRE",
      secteur: "Services publics",
      pays: "Cote d'Ivoire",
      score: {
        date: "2026-05-27",
        global: 66.6,
        fondamental: 73,
        sentiment: 48,
        macro: 71,
        technique: 0,
        signal: "achat"
      },
      prix: {
        date: "2026-05-22",
        cloture: 4950,
        variation: 0.72,
        volume: 7600,
        capitalisation: 198000000000,
        source: "brvm.org"
      },
      fondamentaux: {
        annee: 2024,
        periode: "annuel",
        per: 8.4,
        price_book: 1.5,
        dividende: 315,
        rendement_div: 6.3,
        resultat_net: 28400000000
      },
      actualites: [],
      pipeline: {
        prix_ok: true,
        fondamentaux_ok: true,
        actualites_ok: false,
        scoring_ok: true,
        exclusion_reason: null
      }
    },
    {
      ticker: "PALC",
      nom: "PALMCI",
      secteur: "Agriculture",
      pays: "Cote d'Ivoire",
      score: {
        date: "2026-05-27",
        global: 72.0,
        fondamental: 79,
        sentiment: 60,
        macro: 69,
        technique: 0,
        signal: "achat"
      },
      prix: {
        date: "2026-05-22",
        cloture: 6900,
        variation: 3.18,
        volume: 5400,
        capitalisation: 138000000000,
        source: "brvm.org"
      },
      fondamentaux: {
        annee: 2024,
        periode: "annuel",
        per: 6.7,
        price_book: 1.7,
        dividende: 540,
        rendement_div: 7.8,
        resultat_net: 20300000000
      },
      actualites: [
        {
          date: "2026-05-18",
          source: "Sika Finance",
          titre: "Marge brute soutenue par les cours agricoles",
          sentiment: "positif",
          score_sent: 0.34
        }
      ],
      pipeline: {
        prix_ok: true,
        fondamentaux_ok: true,
        actualites_ok: true,
        scoring_ok: true,
        exclusion_reason: null
      }
    },
    {
      ticker: "SOGC",
      nom: "SOGB COTE D'IVOIRE",
      secteur: "Agriculture",
      pays: "Cote d'Ivoire",
      score: {
        date: "2026-05-27",
        global: 55.3,
        fondamental: 58,
        sentiment: 49,
        macro: 61,
        technique: 0,
        signal: "neutre"
      },
      prix: {
        date: "2026-05-22",
        cloture: 4100,
        variation: -0.48,
        volume: 6100,
        capitalisation: 86100000000,
        source: "brvm.org"
      },
      fondamentaux: {
        annee: 2024,
        periode: "annuel",
        per: 10.8,
        price_book: 1.0,
        dividende: 190,
        rendement_div: 4.6,
        resultat_net: 9200000000
      },
      actualites: [
        {
          date: "2026-05-15",
          source: "BRVM",
          titre: "Rapport annuel depose",
          sentiment: "neutre",
          score_sent: -0.01
        }
      ],
      pipeline: {
        prix_ok: true,
        fondamentaux_ok: true,
        actualites_ok: true,
        scoring_ok: true,
        exclusion_reason: null
      }
    },
    {
      ticker: "ETIT",
      nom: "ECOBANK TRANSNATIONAL INCORPORATED",
      secteur: "Finance",
      pays: "Togo",
      score: {
        date: "2026-05-27",
        global: 44.4,
        fondamental: 41,
        sentiment: 52,
        macro: 46,
        technique: 0,
        signal: "vente"
      },
      prix: {
        date: "2026-05-22",
        cloture: 18,
        variation: -2.7,
        volume: 144800,
        capitalisation: 442000000000,
        source: "sikafinance.com"
      },
      fondamentaux: {
        annee: 2024,
        periode: "annuel",
        per: 14.2,
        price_book: 0.8,
        dividende: 0,
        rendement_div: 0,
        resultat_net: 128000000000
      },
      actualites: [
        {
          date: "2026-05-13",
          source: "Sika Finance",
          titre: "Volatilite accrue sur volumes eleves",
          sentiment: "negatif",
          score_sent: -0.26
        }
      ],
      pipeline: {
        prix_ok: true,
        fondamentaux_ok: true,
        actualites_ok: true,
        scoring_ok: true,
        exclusion_reason: null
      }
    },
    {
      ticker: "ONTBF",
      nom: "ONATEL BURKINA FASO PREF",
      secteur: "Telecom",
      pays: "Burkina Faso",
      score: {
        date: "2026-05-27",
        global: 48.2,
        fondamental: 45,
        sentiment: 52,
        macro: 50,
        technique: 0,
        signal: "vente"
      },
      prix: {
        date: "2026-05-22",
        cloture: 3220,
        variation: -1.12,
        volume: 1700,
        capitalisation: 64400000000,
        source: "brvm.org"
      },
      fondamentaux: {
        annee: 2024,
        periode: "S1",
        per: 12.6,
        price_book: 1.9,
        dividende: 120,
        rendement_div: 3.7,
        resultat_net: 7800000000
      },
      actualites: [],
      pipeline: {
        prix_ok: true,
        fondamentaux_ok: true,
        actualites_ok: false,
        scoring_ok: true,
        exclusion_reason: null
      }
    },
    {
      ticker: "SCRC",
      nom: "SUCRIVOIRE",
      secteur: "Consommation",
      pays: "Cote d'Ivoire",
      score: {
        date: "2026-05-27",
        global: 51.5,
        fondamental: 43,
        sentiment: 57,
        macro: 58,
        technique: 0,
        signal: "vente"
      },
      prix: {
        date: "2026-05-22",
        cloture: 880,
        variation: -0.9,
        volume: 2240,
        capitalisation: 26400000000,
        source: "brvm.org"
      },
      fondamentaux: {
        annee: 2024,
        periode: "annuel",
        per: null,
        price_book: 0.7,
        dividende: 0,
        rendement_div: 0,
        resultat_net: -1800000000
      },
      actualites: [
        {
          date: "2026-05-12",
          source: "BRVM",
          titre: "Resultat annuel sous pression",
          sentiment: "negatif",
          score_sent: -0.38
        }
      ],
      pipeline: {
        prix_ok: true,
        fondamentaux_ok: true,
        actualites_ok: true,
        scoring_ok: true,
        exclusion_reason: null
      }
    },
    {
      ticker: "ORGT",
      nom: "ORAGROUP TOGO",
      secteur: "Finance",
      pays: "Togo",
      score: {
        date: null,
        global: null,
        fondamental: null,
        sentiment: null,
        macro: null,
        technique: null,
        signal: null
      },
      prix: {
        date: "2026-05-22",
        cloture: 1220,
        variation: -4.35,
        volume: 18300,
        capitalisation: 84200000000,
        source: "sikafinance.com"
      },
      fondamentaux: {
        annee: 2024,
        periode: "annuel",
        per: null,
        price_book: 0.4,
        dividende: 0,
        rendement_div: 0,
        resultat_net: -21200000000
      },
      actualites: [
        {
          date: "2026-05-10",
          source: "Sika Finance",
          titre: "Resultats defavorables et couverture partielle",
          sentiment: "negatif",
          score_sent: -0.61
        }
      ],
      pipeline: {
        prix_ok: true,
        fondamentaux_ok: true,
        actualites_ok: true,
        scoring_ok: false,
        exclusion_reason: "per_not_applicable"
      }
    },
    {
      ticker: "UNLC",
      nom: "UNILEVER COTE D'IVOIRE",
      secteur: "Consommation",
      pays: "Cote d'Ivoire",
      score: {
        date: null,
        global: null,
        fondamental: null,
        sentiment: null,
        macro: null,
        technique: null,
        signal: null
      },
      prix: {
        date: "2026-05-22",
        cloture: 5100,
        variation: -3.08,
        volume: 980,
        capitalisation: 45900000000,
        source: "brvm.org"
      },
      fondamentaux: {
        annee: 2024,
        periode: "annuel",
        per: null,
        price_book: null,
        dividende: 0,
        rendement_div: 0,
        resultat_net: -7600000000
      },
      actualites: [
        {
          date: "2026-05-11",
          source: "BRVM",
          titre: "Capitaux propres sous surveillance",
          sentiment: "negatif",
          score_sent: -0.48
        }
      ],
      pipeline: {
        prix_ok: true,
        fondamentaux_ok: true,
        actualites_ok: true,
        scoring_ok: false,
        exclusion_reason: "negative_equity"
      }
    }
  ]
};
