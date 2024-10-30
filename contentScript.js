// contentScript.js

// Mapping of taxonomy IDs to species names
const taxonomyMap = {
    "9615": "Canine",
    "9606": "Human",
    "9913": "Cattle",
    "10090": "Mouse",
};

// Base URL for Snipe search
const SNIPE_BASE_URL = 'https://snipe-bio.github.io/explore/dev';

// Function to create the "Explore with Snipe" button with specific text
function createSnipeButton(params, type) {
    console.log('Creating Snipe Button with params:', params, 'and type:', type);
    const button = document.createElement('a');
    button.className = 'snipe-button'; // Assign the button class

    // Determine button text based on type
    let buttonText = '';
    switch (type) {
        case 'bioproject':
            buttonText = 'Explore Bioproject with Snipe';
            break;
        case 'biosample':
            buttonText = 'Explore BioSample with Snipe';
            break;
        case 'experiment':
            buttonText = 'Explore Experiment with Snipe';
            break;
        case 'species':
            buttonText = 'Explore Species with Snipe';
            break;
        default:
            buttonText = 'Explore with Snipe';
    }

    button.textContent = buttonText; // Button text

    // Accessibility attributes
    button.setAttribute('role', 'button');
    button.setAttribute('aria-label', buttonText);

    // Construct the URL with query parameters
    const url = new URL(SNIPE_BASE_URL);
    for (const key in params) {
        if (params[key]) {
            url.searchParams.append(key, params[key]);
        }
    }

    console.log('Constructed Snipe URL:', url.toString());

    // Set the href and target attributes
    button.href = url.toString();
    button.target = '_blank';
    button.rel = 'noopener noreferrer';

    return button;
}

// Function to highlight and add the button to an element
function highlightElement(element, params, type) {
    console.log('Highlighting element:', element, 'with params:', params, 'and type:', type);
    if (!element) return;

    // Add highlight class
    element.classList.add('snipe-highlight');

    // Create button container
    const buttonContainer = document.createElement('span');
    buttonContainer.className = 'snipe-button-container';

    // Create and append the button
    const button = createSnipeButton(params, type);
    buttonContainer.appendChild(button);

    // Append the button container after the element
    element.parentElement.appendChild(buttonContainer);
}

// Main function to process the page
function processPage() {
    console.log('Processing page...');

    // Get the Experiment ID
    const experimentLink = document.querySelector('a[href^="/sra/SRX"], a[href^="/sra/ERX"]');
    const experimentID = experimentLink ? experimentLink.textContent.trim() : null;

    // Get the BioProject
    const bioprojectLink = document.querySelector('a[href^="/bioproject/"]');
    const bioprojectID = bioprojectLink ? bioprojectLink.textContent.trim() : null;

    // Get the BioSample
    const biosampleLink = document.querySelector('a[href^="/biosample/"]');
    const biosampleID = biosampleLink ? biosampleLink.textContent.trim() : null;

    // Get the Species
    const speciesLink = document.querySelector('a[href^="/Taxonomy/Browser/wwwtax.cgi"]');
    let species = null;
    if (speciesLink) {
        const taxIDMatch = speciesLink.href.match(/id=(\d+)/);
        if (taxIDMatch) {
            const taxID = taxIDMatch[1];
            species = taxonomyMap[taxID];
        }
    }

    console.log('Found species:', species);

    // Only proceed if species is supported
    if (!species) {
        console.log('Species not supported. Exiting.');
        return; // Do not display any buttons if species is not supported
    }

    // Highlight and add buttons for supported species
    if (experimentLink && experimentID) {
        highlightElement(experimentLink, { 'sra-exp': experimentID, species }, 'experiment');
    }
    if (bioprojectLink && bioprojectID) {
        highlightElement(bioprojectLink, { 'bioproject': bioprojectID, species }, 'bioproject');
    }
    if (biosampleLink && biosampleID) {
        highlightElement(biosampleLink, { 'biosample': biosampleID, species }, 'biosample');
    }
    if (speciesLink && species) {
        highlightElement(speciesLink, { 'species': species }, 'species');
    }
}

// Run the main function when the DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processPage);
} else {
    processPage();
}
