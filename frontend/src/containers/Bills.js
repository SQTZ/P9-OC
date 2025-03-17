import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    
    // Attacher les événements après un court délai pour s'assurer que le DOM est prêt
    setTimeout(() => {
      console.log('Attaching events to Bills UI elements')
      const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
      if (buttonNewBill) {
        console.log('Found new bill button, attaching click event')
        buttonNewBill.addEventListener('click', this.handleClickNewBill)
      } else {
        console.warn('New bill button not found in the DOM')
      }
      
      const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
      if (iconEye && iconEye.length > 0) {
        console.log(`Found ${iconEye.length} eye icons, attaching click events`)
        iconEye.forEach(icon => {
          icon.addEventListener('click', () => this.handleClickIconEye(icon))
        })
      } else {
        console.warn('No eye icons found in the DOM')
      }
    }, 100)
    
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    // Set the image source in the modal
    $('#modaleFile').find(".modal-body").html(`
      <div style='text-align: center;' class="bill-proof-container">
        <img width=${imgWidth} src=${billUrl} alt="Bill" />
      </div>
    `)
    $('#modaleFile').modal('show') // Show the modal
  }

  getBills = () => {
    if (this.store) {
      return this.store.bills().list().then(snapshot => {
        const bills = snapshot
          .map(doc => {
            try {
              return {
                ...doc,
                date: formatDate(doc.date),
                status: formatStatus(doc.status)
              }
            } catch(e) {
              console.log(e,'for',doc)
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status)
              }
            }
          })
          .sort((a, b) => new Date(b.date) < new Date(a.date) ? 1 : -1) // Tri par date décroissante
        
        console.log('Bills retrieved:', bills) // Ajout de log pour déboguer
        return bills
      })
    }
  }
}
