import eyeBlueIcon from "../assets/svg/eye_blue.js"
import downloadBlueIcon from "../assets/svg/download_blue.js"

export default (billUrl) => {
  // Si billUrl est null, undefined ou vide, ne pas rendre l'icône cliquable
  if (!billUrl) {
    return (
      `<div class="icon-actions">
        <div id="eye" data-testid="icon-eye">
          ${eyeBlueIcon}
        </div>
      </div>`
    )
  }
  
  return (
    `<div class="icon-actions">
      <div id="eye" data-testid="icon-eye" data-bill-url=${billUrl}>
      ${eyeBlueIcon}
      </div>
    </div>`
  )
}