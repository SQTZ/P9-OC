import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile.bind(this))
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }

  handleChangeFile = async (e) => {
    e.preventDefault()
    const file = e.target.files[0]
    const fileName = file.name

    const fileType = file.type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(fileType)) {
      alert('Please upload file having extensions .jpeg/.jpg/.png only.')
      e.target.value = ''
      return null
    }
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const { fileUrl, key } = await this.store.bills().create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      
      if (!fileUrl) {
        this.fileUrl = `http://localhost:5678/public/${file.name}`
      } else {
        this.fileUrl = fileUrl
      }
      
      this.billId = key
      this.fileName = fileName
      return { fileUrl: this.fileUrl, key, fileName }
    } catch(error) {
      console.error('Error uploading file:', error)
      e.target.value = ''
      throw error
    }
  }
  
  handleSubmit = e => {
    e.preventDefault()
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    
    this.createBill(bill)
    
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  createBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .create({data: JSON.stringify(bill)})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => {
        console.error('Error creating bill:', error)
      })
    }
  }
  
  // Méthode utilisée uniquement pour les tests
  updateBill = (bill) => {
    if (this.store) {
      return this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then((response) => {
        this.onNavigate(ROUTES_PATH['Bills'])
        return response
      })
      .catch(error => {
        console.error('Error updating bill:', error)
        throw error
      })
    }
    return null
  }
}
