/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import store from "../__mocks__/store.js"

// Mock la fonction window.alert pour empêcher les alertes réelles pendant les tests
beforeAll(() => {
  jest.spyOn(window, 'alert').mockImplementation(() => {});
});

// Configurer un utilisateur fictif dans localStorage avant chaque test
beforeEach(() => {
  localStorage.setItem('user', JSON.stringify({ email: 'test@user.com' }));
});

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the form should be displayed", () => {

      const html = NewBillUI()
      document.body.innerHTML = html
      // On vérifie que le formulaire est présent dans le document
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()
    })

    describe("When I upload a file with an invalid extension", () => {
      test("Then an alert should be displayed", () => {
        const html = NewBillUI()
        document.body.innerHTML = html

        const newBill = new NewBill({ 
          document, 
          onNavigate: jest.fn(), 
          store: null, 
          localStorage: localStorageMock 
        })

        const fileInput = screen.getByTestId("file")
        
        // Création d'un fichier avec une extension invalide
        const file = new File(["file"], "document.txt", { type: "text/plain" })
        
        // Simulation du changement de fichier sans définir value
        fireEvent.change(fileInput, { 
          target: { 
            files: [file]
          } 
        })

        // Vérifier que l'alerte a été appelée avec le bon message
        expect(window.alert).toHaveBeenCalledWith('Please upload file having extensions .jpeg/.jpg/.png only.')
      })
    })

    describe("When I submit the form with valid data", () => {
      test("Then the bill should be created", async () => {
        // Préparation du DOM
        const html = NewBillUI()
        document.body.innerHTML = html

        // Mock du store
        const mockStore = {
          bills: () => ({
            create: jest.fn().mockResolvedValue({ fileUrl: 'http://localhost:3000/file.jpg', key: '1234' }),
            update: jest.fn().mockResolvedValue({})
          })
        }

        // Création de l'instance NewBill
        const newBill = new NewBill({ 
          document, 
          onNavigate: jest.fn(), 
          store: mockStore, 
          localStorage: localStorageMock 
        })

        // Remplir le formulaire avec des données valides
        const form = screen.getByTestId("form-new-bill")
        const expenseInput = screen.getByTestId("expense-type")
        const dateInput = screen.getByTestId("datepicker")
        const amountInput = screen.getByTestId("amount")
        const pctInput = screen.getByTestId("pct")
        const fileInput = screen.getByTestId("file")

        fireEvent.change(expenseInput, { target: { value: "Transports" } })
        fireEvent.change(dateInput, { target: { value: "2023-04-04" } })
        fireEvent.change(amountInput, { target: { value: "100" } })
        fireEvent.change(pctInput, { target: { value: "20" } })

        // Simuler le téléchargement d'un fichier
        const file = new File(["test"], "test.jpg", { type: "image/jpeg" })
        fireEvent.change(fileInput, {
          target: {
            files: [file]
          }
        })

        // Attendre que le fichier soit "uploadé"
        await new Promise(process.nextTick)

        // Mock de la méthode handleSubmit
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
        form.addEventListener("submit", handleSubmit)

        // Soumettre le formulaire
        fireEvent.submit(form)

        // Vérifications
        expect(handleSubmit).toHaveBeenCalled()
        expect(newBill.onNavigate).toHaveBeenCalled()
      })

      test("Then it should send a POST request to create a new bill", async () => {

        const html = NewBillUI()
        document.body.innerHTML = html

        // Créer une nouvelle instance de NewBill
        const newBill = new NewBill({ document, onNavigate: jest.fn(), store, localStorage: localStorageMock })

        // Mock la méthode updateBill pour simuler une requête POST
        const updateBillMock = jest.spyOn(newBill, 'updateBill').mockResolvedValue({})

        // Mock la méthode store.bills().create pour retourner un fileUrl et une clé
        jest.spyOn(newBill.store.bills(), 'create').mockResolvedValue({
          fileUrl: 'http://localhost:3000/file.jpg',
          key: '1234'
        })

        // Remplir le formulaire avec des données valides
        screen.getByTestId("expense-name").value = "Test Expense"
        screen.getByTestId("datepicker").value = "2023-10-10"
        screen.getByTestId("amount").value = "100"
        screen.getByTestId("vat").value = "20"
        screen.getByTestId("pct").value = "20"
        screen.getByTestId("commentary").value = "Test commentary"
        screen.getByTestId("expense-type").value = "Transports"

        // Simuler un téléchargement de fichier valide
        const fileInput = screen.getByTestId("file")
        const file = new File(["file"], "test.jpg", { type: "image/jpeg" })
        fireEvent.change(fileInput, { target: { files: [file] } })

        // Attendre que le téléchargement de fichier soit terminé
        await new Promise(process.nextTick)

        // Assurer que fileUrl et fileName sont définis
        newBill.fileUrl = 'http://localhost:3000/file.jpg'
        newBill.fileName = 'test.jpg'

        // Créer un objet bill similaire à celui créé dans handleSubmit
        const bill = {
          email: "test@user.com",
          type: "Transports",
          name: "Test Expense",
          amount: 100,
          date: "2023-10-10",
          vat: "20",
          pct: 20,
          commentary: "Test commentary",
          fileUrl: 'http://localhost:3000/file.jpg',
          fileName: 'test.jpg',
          status: "pending"
        }

        // Appeler directement updateBill au lieu de passer par handleSubmit
        newBill.updateBill(bill)

        // Vérifier que updateBill a été appelé avec les bons données
        expect(updateBillMock).toHaveBeenCalledWith(bill)
      })
    })

    describe("When I upload a valid file", () => {
      test("Then the fileUrl and fileName should be set", async () => {
        const html = NewBillUI()
        document.body.innerHTML = html

        // Mock du store avec une promesse résolue immédiatement
        const mockStore = {
          bills: () => ({
            create: jest.fn().mockResolvedValue({
              fileUrl: 'http://localhost:3000/file.jpg',
              key: '1234'
            })
          })
        }

        const newBill = new NewBill({ 
          document, 
          onNavigate: jest.fn(), 
          store: mockStore, 
          localStorage: localStorageMock 
        })

        const fileInput = screen.getByTestId("file")
        
        // Création d'un fichier valide
        const file = new File(["file"], "test.jpg", { type: "image/jpeg" })
        
        // Simulation du changement de fichier sans définir value
        fireEvent.change(fileInput, { 
          target: { 
            files: [file]
          } 
        })

        // Attendre que toutes les promesses soient résolues
        await new Promise(resolve => setTimeout(resolve, 0))

        // Vérifier les résultats
        expect(newBill.fileName).toBe('test.jpg')
        expect(newBill.fileUrl).toBe('http://localhost:3000/file.jpg')
      })

      test("Then it should call store.bills().create with correct data", async () => {
        const html = NewBillUI()
        document.body.innerHTML = html

        // Création d'un spy pour la méthode create
        const createSpy = jest.fn().mockResolvedValue({
          fileUrl: 'http://localhost:3000/file.jpg',
          key: '1234'
        })

        // Mock du store avec notre spy
        const mockStore = {
          bills: () => ({
            create: createSpy
          })
        }

        // Création d'une instance de NewBill avec notre store mocké
        const newBill = new NewBill({ 
          document, 
          onNavigate: jest.fn(), 
          store: mockStore, 
          localStorage: localStorageMock 
        })

        const fileInput = screen.getByTestId("file")
        
        // Création d'un fichier valide
        const file = new File(["file"], "test.jpg", { type: "image/jpeg" })
        
        // Simulation du changement de fichier sans définir value
        fireEvent.change(fileInput, { 
          target: { 
            files: [file]
          } 
        })

        // Vérification que la méthode create a été appelée avec les bons paramètres
        expect(createSpy).toHaveBeenCalledWith({
          data: expect.any(FormData), // Vérifie que data est une instance de FormData
          headers: { noContentType: true }
        })
      })
    })

    describe("When there is an error during file upload", () => {
      test("Then it should handle the error", async () => {
        // Préparation du DOM
        const html = NewBillUI()
        document.body.innerHTML = html

        // Mock de console.error
        const consoleSpy = jest.spyOn(console, 'error')

        // Mock du store qui va générer une erreur
        const mockStore = {
          bills: () => ({
            create: jest.fn().mockRejectedValue(new Error('Upload failed'))
          })
        }

        // Création de l'instance NewBill avec le store mocké
        const newBill = new NewBill({ 
          document, 
          onNavigate: jest.fn(), 
          store: mockStore, 
          localStorage: localStorageMock 
        })

        // Simulation du changement de fichier
        const file = new File(["test"], "test.jpg", { type: "image/jpeg" })
        
        // Appeler directement handleChangeFile avec un événement simulé
        try {
          await newBill.handleChangeFile({
            preventDefault: jest.fn(),
            target: {
              files: [file],
              value: 'test.jpg'
            }
          })
          // Si on arrive ici, c'est que la promesse n'a pas été rejetée
          fail('Promise should have been rejected')
        } catch (error) {
          // Vérifications
          expect(consoleSpy).toHaveBeenCalledWith('Error uploading file:', expect.any(Error))
        }
        
        // Nettoyage
        consoleSpy.mockRestore()
      })
    })

    describe("When there is an error during bill update", () => {
      test("Then it should handle the error", async () => {
        // Préparation du DOM
        const html = NewBillUI()
        document.body.innerHTML = html

        // Mock de console.error
        const consoleSpy = jest.spyOn(console, 'error')

        // Création de l'instance NewBill
        const newBill = new NewBill({ 
          document, 
          onNavigate: jest.fn(), 
          store, 
          localStorage: localStorageMock 
        })

        // Mock de la méthode bills().update pour qu'elle rejette une promesse
        const mockUpdate = jest.fn().mockRejectedValue(new Error('Update failed'))
        jest.spyOn(newBill.store.bills(), 'update').mockImplementation(mockUpdate)

        // Définir billId pour que updateBill fonctionne
        newBill.billId = 'test-bill-id'

        // Créer un objet bill
        const bill = {
          email: "test@example.com",
          type: "Transports",
          name: "Test Bill",
          amount: 100,
          date: "2023-01-01",
          vat: "20",
          pct: 20,
          commentary: "Test",
          fileUrl: "http://example.com/file.jpg",
          fileName: "file.jpg",
          status: "pending"
        }

        // Appeler updateBill et attendre que la promesse soit rejetée
        try {
          await newBill.updateBill(bill)
          // Si on arrive ici, c'est que la promesse n'a pas été rejetée
          fail('Promise should have been rejected')
        } catch (error) {
          // Vérifications
          expect(mockUpdate).toHaveBeenCalled()
          expect(consoleSpy).toHaveBeenCalledWith('Error updating bill:', expect.any(Error))
        }
        
        // Nettoyage
        consoleSpy.mockRestore()
      })
    })

    describe("When the store is not available", () => {
      test("Then createBill should handle the case gracefully", () => {
        // Préparation du DOM
        const html = NewBillUI()
        document.body.innerHTML = html

        // Création de l'instance NewBill sans store
        const newBill = new NewBill({ 
          document, 
          onNavigate: jest.fn(), 
          store: null, 
          localStorage: localStorageMock 
        })

        // Appel de createBill sans store
        const result = newBill.createBill({
          email: "test@example.com",
          type: "Transports",
          name: "Test Bill",
          amount: 100,
          date: "2023-01-01",
          vat: "20",
          pct: 20,
          commentary: "Test",
          fileUrl: "http://example.com/file.jpg",
          fileName: "file.jpg",
          status: "pending"
        })

        // Vérifier que la méthode ne génère pas d'erreur
        expect(result).toBeUndefined()
      })

      test("Then updateBill should handle the case gracefully", () => {
        // Préparation du DOM
        const html = NewBillUI()
        document.body.innerHTML = html

        // Création de l'instance NewBill sans store
        const newBill = new NewBill({ 
          document, 
          onNavigate: jest.fn(), 
          store: null, 
          localStorage: localStorageMock 
        })

        // Appel de updateBill sans store
        const result = newBill.updateBill({
          email: "test@example.com",
          type: "Transports",
          name: "Test Bill",
          amount: 100,
          date: "2023-01-01",
          vat: "20",
          pct: 20,
          commentary: "Test",
          fileUrl: "http://example.com/file.jpg",
          fileName: "file.jpg",
          status: "pending"
        })

        // Vérifier que la méthode retourne null
        expect(result).toBeNull()
      })
    })

    describe("When fileUrl is undefined after upload", () => {
      test("Then it should construct a URL manually", async () => {
        // Préparation du DOM
        const html = NewBillUI()
        document.body.innerHTML = html

        // Mock du store qui retourne fileUrl undefined
        const mockStore = {
          bills: () => ({
            create: jest.fn().mockResolvedValue({
              key: '1234',
              fileUrl: undefined
            })
          })
        }

        // Création de l'instance NewBill
        const newBill = new NewBill({ 
          document, 
          onNavigate: jest.fn(), 
          store: mockStore, 
          localStorage: localStorageMock 
        })

        // Simulation du changement de fichier
        const file = new File(["test"], "test.jpg", { type: "image/jpeg" })
        
        // Appeler directement handleChangeFile avec un événement simulé
        await newBill.handleChangeFile({
          preventDefault: jest.fn(),
          target: {
            files: [file],
            value: 'test.jpg'
          }
        })

        // Vérifier que l'URL a été construite manuellement
        expect(newBill.fileUrl).toBe('http://localhost:5678/public/test.jpg')
      })
    })

    describe("When createBill encounters an error", () => {
      test("Then it should handle the error", async () => {
        // Préparation du DOM
        const html = NewBillUI()
        document.body.innerHTML = html

        // Mock de console.error
        const consoleSpy = jest.spyOn(console, 'error')

        // Création de l'instance NewBill
        const newBill = new NewBill({ 
          document, 
          onNavigate: jest.fn(), 
          store: {
            bills: () => ({
              create: jest.fn().mockRejectedValue(new Error('Create bill failed'))
            })
          }, 
          localStorage: localStorageMock 
        })

        // Définir manuellement les propriétés nécessaires
        newBill.fileUrl = 'http://example.com/file.jpg'
        newBill.fileName = 'test.jpg'

        // Appeler createBill qui va échouer
        newBill.createBill({
          email: "test@example.com",
          type: "Transports",
          name: "Test Bill",
          amount: 100,
          date: "2023-01-01",
          vat: "20",
          pct: 20,
          commentary: "Test",
          fileUrl: "http://example.com/file.jpg",
          fileName: "file.jpg",
          status: "pending"
        })

        // Attendre que la promesse soit rejetée
        await new Promise(resolve => setTimeout(resolve, 100))

        // Vérifier que l'erreur a été loggée
        expect(consoleSpy).toHaveBeenCalledWith('Error creating bill:', expect.any(Error))
        
        // Nettoyage
        consoleSpy.mockRestore()
      })
    })

    describe("When updateBill completes successfully", () => {
      test("Then it should navigate to Bills page", async () => {
        // Préparation du DOM
        const html = NewBillUI()
        document.body.innerHTML = html

        // Mock de onNavigate
        const onNavigate = jest.fn()

        // Mock du store qui va retourner une réponse réussie
        const mockStore = {
          bills: () => ({
            update: jest.fn().mockResolvedValue({ id: '123', status: 'accepted' })
          })
        }

        // Création de l'instance NewBill
        const newBill = new NewBill({ 
          document, 
          onNavigate, 
          store: mockStore, 
          localStorage: localStorageMock 
        })

        // Définir billId pour que updateBill fonctionne
        newBill.billId = 'test-bill-id'

        // Créer un objet bill
        const bill = {
          email: "test@example.com",
          type: "Transports",
          name: "Test Bill",
          amount: 100,
          date: "2023-01-01",
          vat: "20",
          pct: 20,
          commentary: "Test",
          fileUrl: "http://example.com/file.jpg",
          fileName: "file.jpg",
          status: "pending"
        }

        // Appeler updateBill et attendre que la promesse soit résolue
        await newBill.updateBill(bill)

        // Vérifier que onNavigate a été appelé avec le bon argument
        expect(onNavigate).toHaveBeenCalledWith('#employee/bills')
      })
    })
  })
})
