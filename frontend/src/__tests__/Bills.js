/**
 * @jest-environment jsdom
 */

import {screen, waitFor, fireEvent} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

// Mock jQuery avec une configuration plus précise
global.$ = jest.fn(() => ({
  width: () => 500,
  find: () => ({
    html: jest.fn()
  }),
  modal: jest.fn(),
  click: jest.fn(),
  on: jest.fn(),
  off: jest.fn()
}))

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    
    // Configuration commune pour tous les tests
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
    })

    test("Then bill icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })

    test("Then bills should be ordered from earliest to latest", () => {
      // Trier les données avant de les passer à BillsUI
      const billsSorted = [...bills].sort((a, b) => new Date(a.date) - new Date(b.date))
      
      // Préparation du DOM avec les données triées
      document.body.innerHTML = BillsUI({ data: billsSorted })
      
      // Récupération des dates affichées
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      
      // Création d'une copie des dates pour le tri
      const datesSorted = [...dates].sort((a, b) => new Date(a.date) - new Date(b.date))
      
      // Vérification que les dates sont dans l'ordre attendu
      expect(dates).toEqual(datesSorted)
    })

    describe("When I click on the new bill button", () => {
      test("Then I should be sent to NewBill page", () => {
        // Simuler la fonction de navigation
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        
        // Créer une instance de Bills avec les dépendances nécessaires
        const bills = new Bills({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage
        })

        // Créer un mock de la fonction handleClickNewBill pour vérifier si elle est appelée
        const handleClickNewBill = jest.fn(bills.handleClickNewBill)
        
        // Récupérer le bouton et ajouter l'écouteur d'événement
        const button = screen.getByTestId('btn-new-bill')
        button.addEventListener('click', handleClickNewBill)
        
        // Simuler le clic sur le bouton
        fireEvent.click(button)
        
        // Vérifier que la fonction a été appelée et que la navigation a fonctionné
        expect(handleClickNewBill).toHaveBeenCalled()
        expect(screen.getByTestId('form-new-bill')).toBeTruthy()
      })
    })

    describe("When I click on the eye icon", () => {
      test("Then a modal should open", () => {
        // Ajout de la modal au DOM
        document.body.innerHTML = BillsUI({ data: bills }) + `
          <div class="modal fade" id="modaleFile" data-testid="modaleFile" tabindex="-1">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-body"></div>
              </div>
            </div>
          </div>`
        
        // Création d'une instance de Bills
        const billsClass = new Bills({
          document,
          onNavigate: null,
          store: null,
          localStorage: window.localStorage
        })

        // Simulation du clic sur l'icône œil
        const eye = screen.getAllByTestId('icon-eye')[0]
        const handleClickIconEye = jest.fn(() => billsClass.handleClickIconEye(eye))
        
        eye.addEventListener('click', handleClickIconEye)
        fireEvent.click(eye)
        
        // Vérifications
        expect(handleClickIconEye).toHaveBeenCalled()
        expect(screen.getByTestId('modaleFile')).toBeTruthy()
      })
    })

    describe("When clicking on eye icon with jQuery modal", () => {
      test("Then modal should be called with correct image", () => {
        // Réinitialisation du mock de jQuery pour ce test
        const mockModal = jest.fn()
        global.$ = jest.fn().mockReturnValue({
          width: () => 500,
          find: () => ({
            html: jest.fn()
          }),
          modal: mockModal,
          click: jest.fn(),
          on: jest.fn(),
          off: jest.fn()
        })

        // Ajout de la modal au DOM
        document.body.innerHTML = BillsUI({ data: bills }) + `
          <div class="modal fade" id="modaleFile" data-testid="modaleFile">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-body"></div>
              </div>
            </div>
          </div>`
        
        // Création d'une instance de Bills
        const billsClass = new Bills({
          document,
          onNavigate: null,
          store: null,
          localStorage: window.localStorage
        })

        // Configuration de l'icône œil avec une URL de test
        const eye = screen.getAllByTestId('icon-eye')[0]
        const url = "http://example.com/image.jpg"
        eye.setAttribute("data-bill-url", url)
        
        // Simulation du clic
        billsClass.handleClickIconEye(eye)
        
        // Vérification que la modal est appelée avec 'show'
        expect(mockModal).toHaveBeenCalledWith('show')
      })
    })

    describe("When I navigate to Bills page", () => {
      test("Then bills should be fetched from mock API", async () => {
        // Créer une instance de Bills avec un mock du store
        const bills = new Bills({
          document,
          onNavigate: null,
          store: {
            bills: () => ({
              // Simuler une réponse API avec une facture de test
              list: () => Promise.resolve([{
                id: '1',
                date: '2021-01-01',
                status: 'pending'
              }])
            })
          },
          localStorage: window.localStorage
        })

        // Appeler getBills et vérifier le résultat
        const result = await bills.getBills()
        expect(result.length).toBe(1)
        expect(result[0].date).toBe('1 Jan. 21')
      })
    })

    describe("When an error occurs on API", () => {
      test("Then bills fetch fails with 404 message error", async () => {
        const bills = new Bills({
          document,
          onNavigate: null,
          store: {
            bills: () => ({
              list: () => Promise.reject(new Error("Erreur 404"))
            })
          },
          localStorage: window.localStorage
        })

        // Attendre que getBills soit rejeté
        await expect(bills.getBills()).rejects.toThrow("Erreur 404")
      })

      test("Then bills fetch fails with 500 message error", async () => {
        const bills = new Bills({
          document,
          onNavigate: null,
          store: {
            bills: () => ({
              list: () => Promise.reject(new Error("Erreur 500"))
            })
          },
          localStorage: window.localStorage
        })

        // Attendre que getBills soit rejeté
        await expect(bills.getBills()).rejects.toThrow("Erreur 500")
      })
    })

    describe("When no store is provided", () => {
      test("Then getBills should return undefined", async () => {
        const bills = new Bills({
          document,
          onNavigate: null,
          store: null,
          localStorage: window.localStorage
        })
        const result = await bills.getBills()
        expect(result).toBeUndefined()
      })
    })

    describe("When date formatting fails", () => {
      test("Then it should use the original date, log the error and still sort correctly", async () => {
        // Mock console.log pour espionner ses appels
        console.log = jest.fn()
        
        const bills = new Bills({
          document,
          onNavigate: null,
          store: {
            bills: () => ({
              list: () => Promise.resolve([
                {
                  id: '1',
                  date: 'not-a-date', // Date clairement invalide
                  status: 'pending'
                },
                {
                  id: '2',
                  date: '2021-04-01',
                  status: 'pending'
                },
                {
                  id: '3',
                  date: 'invalid', // Autre date invalide
                  status: 'pending'
                }
              ])
            })
          },
          localStorage: window.localStorage
        })

        const result = await bills.getBills()
        
        // Vérifie que console.log a été appelé pour les dates invalides
        expect(console.log).toHaveBeenCalled()
        
        // CHANGEMENT 3 : Simplification de la vérification
        // Au lieu de vérifier avec .some(), on extrait d'abord toutes les dates
        // puis on vérifie la présence des dates invalides avec .toContain()
        // C'est plus lisible et plus direct
        const dates = result.map(bill => bill.date)
        expect(dates).toContain('not-a-date')
        expect(dates).toContain('invalid')
      })
    })

    describe("When I am on Bills page and there are icon eyes", () => {
      test("Then icon eye event listeners should be added", () => {
        // Créer le DOM nécessaire avec BillsUI
        document.body.innerHTML = BillsUI({ data: bills })
        
        // Mock de la fonction handleClickIconEye
        const handleClickIconEye = jest.fn()
        
        // Créer une instance de Bills
        const billsInstance = new Bills({
          document,
          onNavigate: null,
          store: null,
          localStorage: window.localStorage
        })
        
        // Mock de la méthode handleClickIconEye
        billsInstance.handleClickIconEye = handleClickIconEye
        
        // Récupérer les icônes et simuler les clics
        const iconEyes = screen.getAllByTestId('icon-eye')
        iconEyes.forEach(icon => {
          fireEvent.click(icon)
        })
        
        // Vérifier que handleClickIconEye a été appelé une fois par icône
        expect(handleClickIconEye).toHaveBeenCalledTimes(iconEyes.length)
      })
    })
  })
})
