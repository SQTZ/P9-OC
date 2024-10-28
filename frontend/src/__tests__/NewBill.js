/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import store from "../__mocks__/store.js"

// Mock the window.alert function to prevent actual alerts during tests
beforeAll(() => {
  jest.spyOn(window, 'alert').mockImplementation(() => {});
});

// Set up a mock user in localStorage before each test
beforeEach(() => {
  localStorage.setItem('user', JSON.stringify({ email: 'test@user.com' }));
});

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the form should be displayed", () => {
      // Render the NewBill UI
      const html = NewBillUI()
      document.body.innerHTML = html
      // Check if the form is present in the document
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
        // Render the NewBill UI
        const html = NewBillUI()
        document.body.innerHTML = html

        // Create a new instance of NewBill
        const newBill = new NewBill({ document, onNavigate: jest.fn(), store, localStorage: localStorageMock })

        // Mock the updateBill method to simulate a POST request
        const updateBillMock = jest.spyOn(newBill, 'updateBill').mockResolvedValue({})

        // Mock the store.bills().create method to return a fileUrl and key
        jest.spyOn(newBill.store.bills(), 'create').mockResolvedValue({
          fileUrl: 'http://localhost:3000/file.jpg',
          key: '1234'
        })

        // Fill in the form with valid data
        screen.getByTestId("expense-name").value = "Test Expense"
        screen.getByTestId("datepicker").value = "2023-10-10"
        screen.getByTestId("amount").value = "100"
        screen.getByTestId("vat").value = "20"
        screen.getByTestId("pct").value = "20"
        screen.getByTestId("commentary").value = "Test commentary"
        screen.getByTestId("expense-type").value = "Transports"

        // Simulate a valid file upload
        const fileInput = screen.getByTestId("file")
        const file = new File(["file"], "test.jpg", { type: "image/jpeg" })
        fireEvent.change(fileInput, { target: { files: [file] } })

        // Wait for the file upload to complete
        await new Promise(process.nextTick)

        // Ensure the fileUrl and fileName are set
        newBill.fileUrl = 'http://localhost:3000/file.jpg'
        newBill.fileName = 'test.jpg'

        // Simulate form submission
        const form = screen.getByTestId("form-new-bill")
        fireEvent.submit(form)

        // Verify that updateBill was called with the correct data
        expect(updateBillMock).toHaveBeenCalledWith({
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
        })
      })
    })

    describe("When I upload a valid file", () => {
      test("Then the fileUrl and fileName should be set", async () => {
        const html = NewBillUI()
        document.body.innerHTML = html

        // Mock store avec une promesse résolue immédiatement
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
        const html = NewBillUI()
        document.body.innerHTML = html

        const newBill = new NewBill({ document, onNavigate: jest.fn(), store, localStorage: localStorageMock })
        jest.spyOn(newBill.store.bills(), 'create').mockRejectedValue(new Error('Error'))

        const fileInput = screen.getByTestId("file")
        const file = new File(["file"], "test.jpg", { type: "image/jpeg" })

        fireEvent.change(fileInput, { target: { files: [file] } })

        await new Promise(process.nextTick) // Wait for async operations

        // Check console.error or any other error handling logic
      })
    })

    describe("When there is an error during bill update", () => {
      test("Then it should handle the error", async () => {
        const html = NewBillUI()
        document.body.innerHTML = html

        const newBill = new NewBill({ document, onNavigate: jest.fn(), store, localStorage: localStorageMock })
        jest.spyOn(newBill.store.bills(), 'update').mockRejectedValue(new Error('Error'))

        const form = screen.getByTestId("form-new-bill")
        fireEvent.submit(form)

        await new Promise(process.nextTick) // Wait for async operations

        // Check console.error or any other error handling logic
      })
    })

    describe("When an error occurs during file upload", () => {
      test("Then it should handle the error", async () => {
        // Préparation du DOM
        const html = NewBillUI()
        document.body.innerHTML = html

        // Mock de console.error
        const consoleSpy = jest.spyOn(console, 'error')

        // Mock du store qui va générer une erreur
        const mockStore = {
          bills: () => ({
            create: jest.fn().mockImplementation(() => {
              throw new Error('Upload failed')
            })
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
        const fileInput = screen.getByTestId("file")
        const file = new File(["test"], "test.jpg", { type: "image/jpeg" })
        
        // Déclencher l'événement de changement de fichier
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
        fileInput.addEventListener("change", handleChangeFile)
        
        fireEvent.change(fileInput, {
          target: {
            files: [file]
          }
        })

        // Attendre que les promesses soient résolues
        await new Promise(process.nextTick)

        // Vérifications
        expect(consoleSpy).toHaveBeenCalled()
        expect(fileInput.value).toBe('')

        // Nettoyage
        consoleSpy.mockRestore()
      })
    })
  })
})
