// AI Translation Dialog functionality
window.showAITranslateDialog = function () {
    // Get languages directly from the Languages tab
    let languages = []
    
    console.log('[AI Translate] Getting languages from UI...')
    
    // Method 1: Try to get from the language list
    const languagesList = $('#languages-list')
    if (languagesList.length > 0) {
        console.log('[AI Translate] Found languages list')
        languagesList.find('.language-row').each(function() {
            const row = $(this)
            const code = row.find('.lang-code').val()
            const name = row.find('.lang-name').val()
            const enabled = row.find('.lang-enabled').prop('checked')
            
            if (code && name) {
                languages.push({
                    code: code,
                    name: name,
                    enabled: enabled
                })
                console.log('[AI Translate] Found language:', code, name, enabled)
            }
        })
    }
    
    // Method 2: Try to get from the current node being edited
    if (languages.length === 0) {
        console.log('[AI Translate] Trying to get from editing node...')
        // Check if we're editing a ui_base node
        if (RED.editor && RED.editor.editStack && RED.editor.editStack.length > 0) {
            const currentEdit = RED.editor.editStack[RED.editor.editStack.length - 1]
            if (currentEdit && currentEdit.node) {
                const node = currentEdit.node
                if (node.type === 'ui_base' && node.languages) {
                    languages = node.languages
                    console.log('[AI Translate] Found languages from editing node:', languages)
                } else if (node._def && node._def.defaults && node._def.defaults.ui) {
                    // Try to find the ui_base through the ui property
                    const uiBaseId = node.ui
                    if (uiBaseId) {
                        const uiBase = RED.nodes.node(uiBaseId)
                        if (uiBase && uiBase.languages) {
                            languages = uiBase.languages
                            console.log('[AI Translate] Found languages from ui_base reference:', languages)
                        }
                    }
                }
            }
        }
    }
    
    // Method 3: Search all config nodes
    if (languages.length === 0) {
        console.log('[AI Translate] Searching all config nodes...')
        RED.nodes.eachConfig(function(n) {
            if (n.type === 'ui_base' && n.languages && n.languages.length > 0) {
                languages = n.languages
                console.log('[AI Translate] Found languages from config node:', n.id, languages)
                return false
            }
        })
    }
    
    // Fallback to defaults if no languages found
    if (languages.length === 0) {
        console.log('[AI Translate] No languages found, using defaults')
        languages = [
            { code: 'en', name: 'English', enabled: true },
            { code: 'fr', name: 'Français', enabled: true },
            { code: 'it', name: 'Italiano', enabled: true },
            { code: 'es', name: 'Español', enabled: true }
        ]
    }
    
    const enabledLanguages = languages.filter(lang => lang.enabled && lang.code && lang.name)

    if (enabledLanguages.length < 2) {
        RED.notify('Please enable at least 2 languages to use AI translation', 'warning')
        return
    }

    const dialog = $('<div>')

    const content = $(`
        <form class="dialog-form" style="height: 100%;">
            <div class="red-ui-palette-category" style="margin: -15px -15px 15px -15px; padding: 10px 15px; background: var(--red-ui-secondary-background, #f3f3f3); border-bottom: 1px solid var(--red-ui-secondary-border-color, #ddd);">
                <div class="red-ui-palette-header">
                    <i class="fa fa-language"></i> Translation Configuration
                </div>
                <p style="margin: 10px 0 0 0; font-size: 0.9em; color: var(--red-ui-secondary-text-color, #666);">
                    Select source and target languages for AI-powered translation of your dashboard UI elements.
                </p>
            </div>
            
            <div class="red-ui-editor-type-expression-tab-content" style="position: relative;">
                <div class="form-row">
                    <label for="ai-source-language" style="width: 120px;">
                        <i class="fa fa-flag-o"></i> Source
                    </label>
                    <select id="ai-source-language" class="node-input" style="width: calc(100% - 130px);">
                        <option value="original">Original (Auto-detect)</option>
                        ${enabledLanguages.map(lang => `<option value="${lang.code}">${lang.name}</option>`).join('')}
                    </select>
                </div>
                
                <div class="form-row">
                    <label style="width: 120px; vertical-align: top;">
                        <i class="fa fa-flags"></i> Targets
                    </label>
                    <div id="ai-target-languages" style="width: calc(100% - 130px); display: flex; flex-direction: column;">
                        ${enabledLanguages.map(lang => `
                            <div class="language-option" style="margin-bottom: 8px;">
                                <label class="ai-language-label" style="display: flex; align-items: center; cursor: pointer; width: 100%;">
                                    <input type="checkbox" id="ai-lang-${lang.code}" value="${lang.code}" style="margin-right: 10px; flex-shrink: 0;">
                                    <span style="flex: 1; text-align: left;">${lang.name}</span>
                                    <span style="color: var(--red-ui-tertiary-text-color, #aaa); font-size: 0.85em; margin-left: 10px;">(${lang.code})</span>
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <hr style="margin: 20px 0; border-color: var(--red-ui-form-border-color, #ddd);">
                
                <div class="form-row">
                    <label for="ai-provider" style="width: 120px;">
                        <i class="fa fa-cloud"></i> Provider
                    </label>
                    <select id="ai-provider" class="node-input" style="width: calc(100% - 130px);">
                        <option value="openai">OpenAI (GPT-3.5/GPT-4)</option>
                        <option value="anthropic">Anthropic (Claude 3)</option>
                    </select>
                </div>
                
                <div class="form-row">
                    <label for="ai-api-key" style="width: 120px;">
                        <i class="fa fa-key"></i> API Key
                    </label>
                    <input type="password" id="ai-api-key" class="node-input" style="width: calc(100% - 130px);" placeholder="Enter your API key">
                </div>
                
                <div class="form-row">
                    <label style="width: 120px;">&nbsp;</label>
                    <div style="width: calc(100% - 130px);">
                        <label class="ai-save-key-label" style="display: flex; align-items: center; cursor: pointer; width: auto;">
                            <input type="checkbox" id="ai-save-key" style="margin-right: 10px;">
                            <span>Save key for this session</span>
                        </label>
                    </div>
                </div>
            </div>
            
            <div class="red-ui-palette-category" style="margin: 15px -15px -15px -15px; padding: 10px 15px; background: var(--red-ui-tertiary-background, #f9f9f9); border-top: 1px solid var(--red-ui-secondary-border-color, #ddd);">
                <div class="form-tips" style="margin: 0; font-size: 0.85em;">
                    <i class="fa fa-info-circle"></i> API keys are stored locally in your browser only.<br>
                    <i class="fa fa-clock-o"></i> Claude API: 2s delay between requests to avoid rate limits.<br>
                    <i class="fa fa-shield"></i> Translations are processed server-side for security.
                </div>
            </div>
        </form>
    `).appendTo(dialog)

    // Load saved API keys
    const savedKeys = {
        openai: localStorage.getItem('nrdb2-ai-key-openai'),
        anthropic: localStorage.getItem('nrdb2-ai-key-anthropic')
    }

    // Update API key when provider changes
    content.find('#ai-provider').on('change', function () {
        const provider = $(this).val()
        const savedKey = savedKeys[provider]
        if (savedKey) {
            content.find('#ai-api-key').val(savedKey)
            content.find('#ai-save-key').prop('checked', true)
        } else {
            content.find('#ai-api-key').val('')
            content.find('#ai-save-key').prop('checked', false)
        }
    }).trigger('change')

    // Update target languages when source changes
    content.find('#ai-source-language').on('change', function () {
        const sourceCode = $(this).val()
        content.find('#ai-target-languages input').each(function () {
            const checkbox = $(this)
            // Don't disable any language if "Original" is selected
            if (sourceCode === 'original') {
                checkbox.prop('disabled', false)
            } else {
                checkbox.prop('disabled', checkbox.val() === sourceCode)
                if (checkbox.val() === sourceCode) {
                    checkbox.prop('checked', false)
                }
            }
        })
    })

    // Add custom styles for the dialog
    const customStyle = $('<style>').html(`
        .language-option:hover label {
            color: var(--red-ui-primary-text-color-focus, #0066cc);
        }
        .language-option input[type="checkbox"]:checked + span {
            font-weight: 600;
            color: var(--red-ui-primary-text-color, #333);
        }
        .ui-dialog.red-ui-editor-dialog .ui-dialog-buttonpane {
            background: var(--red-ui-tertiary-background, #f9f9f9);
            border-top: 1px solid var(--red-ui-secondary-border-color, #ddd);
        }
    `).appendTo('head')

    dialog.dialog({
        title: 'AI Translation Settings',
        modal: true,
        width: 600,
        height: 'auto',
        minHeight: 500,
        classes: {
            'ui-dialog': 'red-ui-editor-dialog',
            'ui-dialog-titlebar': 'red-ui-palette-header',
            'ui-widget-overlay': 'red-ui-editor-dialog'
        },
        open: function () {
            const dialogParent = $(this).parent()
            // Add icon to title
            dialogParent.find('.ui-dialog-title').prepend('<i class="fa fa-magic" style="margin-right: 8px;"></i>')
            // Add icon to translate button
            dialogParent.find('.ui-dialog-buttonset button:first').prepend('<i class="fa fa-language" style="margin-right: 5px;"></i>')
        },
        close: function () {
            customStyle.remove()
        },
        buttons: [
            {
                text: 'Translate',
                class: 'red-ui-button red-ui-button-action',
                click: function () {
                    const sourceLanguage = content.find('#ai-source-language').val()
                    const targetLanguages = []
                    content.find('#ai-target-languages input:checked').each(function () {
                        targetLanguages.push($(this).val())
                    })
                    const provider = content.find('#ai-provider').val()
                    const apiKey = content.find('#ai-api-key').val()

                    if (targetLanguages.length === 0) {
                        RED.notify('Please select at least one target language', 'warning')
                        return
                    }

                    if (!apiKey) {
                        RED.notify('Please enter your API key', 'warning')
                        return
                    }

                    // Save API key if checkbox is checked
                    if (content.find('#ai-save-key').prop('checked')) {
                        localStorage.setItem(`nrdb2-ai-key-${provider}`, apiKey)
                    } else {
                        // Remove saved key if unchecked
                        localStorage.removeItem(`nrdb2-ai-key-${provider}`)
                    }

                    // Start translation
                    performAITranslation(sourceLanguage, targetLanguages, provider, apiKey)
                    $(this).dialog('close')
                }
            },
            {
                text: 'Cancel',
                class: 'red-ui-button',
                click: function () {
                    $(this).dialog('close')
                }
            }
        ]
    })
}

// Perform AI Translation
function performAITranslation (sourceLanguage, targetLanguages, provider, apiKey) {
    // Get the full languages list for reference
    const languages = []
    const languagesList = $('#languages-list')
    if (languagesList.length > 0) {
        languagesList.find('.language-row').each(function() {
            const row = $(this)
            const code = row.find('.lang-code').val()
            const name = row.find('.lang-name').val()
            const enabled = row.find('.lang-enabled').prop('checked')
            
            if (code && name) {
                languages.push({
                    code: code,
                    name: name,
                    enabled: enabled
                })
            }
        })
    }
    // Create progress dialog with Node-RED styling
    const progressDialog = $('<div class="dialog-form">').css({
        padding: '20px',
        textAlign: 'center'
    })

    $('<div>').html('<i class="fa fa-spinner fa-spin" style="font-size: 24px; color: var(--red-ui-primary-text-color, #333); margin-bottom: 15px;"></i>').appendTo(progressDialog)

    const progressBar = $('<div>').css({
        width: '100%',
        height: '20px',
        backgroundColor: 'var(--red-ui-form-input-background, #f0f0f0)',
        border: '1px solid var(--red-ui-form-input-border-color, #bcbcbc)',
        borderRadius: '4px',
        overflow: 'hidden',
        marginTop: '10px'
    }).appendTo(progressDialog)

    const progressFill = $('<div>').css({
        width: '0%',
        height: '100%',
        backgroundColor: 'var(--red-ui-deploy-button-background, #4CAF50)',
        transition: 'width 0.3s ease'
    }).appendTo(progressBar)

    const progressText = $('<div>').css({
        marginTop: '15px',
        fontSize: '14px',
        color: 'var(--red-ui-primary-text-color, #333)'
    }).text('Starting AI translation...').appendTo(progressDialog)

    const progressDialogInstance = progressDialog.dialog({
        title: 'AI Translation Progress',
        modal: true,
        width: 400,
        closeOnEscape: false,
        open: function () {
            $(this).parent().find('.ui-dialog-titlebar-close').hide()
        }
    })

    // Collect all texts to translate
    const textsToTranslate = []
    
    console.log('[AI Translate] Looking for translation fields with data attributes...')
    
    // Look for elements with data-item-id and data-key attributes
    const translationsTab = $('#dashboard-2-tab-translations-content, #translations-list').first()
    
    if (translationsTab.length > 0) {
        // Find all elements with data-item-id attributes
        const itemGroups = {}
        
        // Group elements by data-item-id
        translationsTab.find('[data-item-id]').each(function() {
            const element = $(this)
            const itemId = element.attr('data-item-id')
            const key = element.attr('data-key')
            const lang = element.attr('data-lang')
            
            if (!itemGroups[itemId]) {
                itemGroups[itemId] = {
                    itemId: itemId,
                    key: key,
                    elements: {}
                }
            }
            
            if (lang && element.is('input, textarea')) {
                itemGroups[itemId].elements[lang] = element
            }
        })
        
        // Process each group to collect texts to translate
        Object.values(itemGroups).forEach(group => {
            // Get source text
            let sourceText = ''
            let originalText = ''
            
            if (sourceLanguage === 'original' && group.elements['original']) {
                sourceText = group.elements['original'].val()
                originalText = sourceText
            } else if (group.elements[sourceLanguage]) {
                sourceText = group.elements[sourceLanguage].val()
                originalText = group.elements['original'] ? group.elements['original'].val() : sourceText
            }
            
            if (sourceText && sourceText.trim()) {
                // Get the field label from the parent container
                let label = group.key || 'Field'
                
                // Try to find a better label from the container structure
                const container = group.elements[Object.keys(group.elements)[0]].closest('[data-type]')
                if (container.length > 0) {
                    const labelDiv = container.find('> div').first()
                    if (labelDiv.length > 0) {
                        const labelText = labelDiv.text().replace(':', '').trim()
                        if (labelText) {
                            label = labelText
                        }
                    }
                }
                
                textsToTranslate.push({
                    label,
                    sourceText,
                    originalText,
                    itemId: group.itemId,
                    key: group.key,
                    elements: group.elements
                })
                
                console.log('[AI Translate] Added to translation queue:', label, '=', sourceText)
            }
        })
        
        // Fallback: If no data attributes found, look for the structure
        if (textsToTranslate.length === 0) {
            console.log('[AI Translate] No data attributes found, using fallback method...')
            
            // Find all containers with data-type attribute
            translationsTab.find('[data-type]').each(function() {
                const container = $(this)
                const itemId = container.attr('data-item-id')
                const key = container.attr('data-key')
                
                // Find all language inputs within this container
                const elements = {}
                container.find('input, textarea').each(function() {
                    const input = $(this)
                    const lang = input.attr('data-lang')
                    if (lang) {
                        elements[lang] = input
                    }
                })
                
                // Get source text
                let sourceText = ''
                let originalText = ''
                
                if (sourceLanguage === 'original' && elements['original']) {
                    sourceText = elements['original'].val()
                    originalText = sourceText
                } else if (elements[sourceLanguage]) {
                    sourceText = elements[sourceLanguage].val()
                    originalText = elements['original'] ? elements['original'].val() : sourceText
                }
                
                if (sourceText && sourceText.trim()) {
                    // Get label
                    let label = key || 'Field'
                    const labelDiv = container.find('> div').first()
                    if (labelDiv.length > 0) {
                        const labelText = labelDiv.text().replace(':', '').trim()
                        if (labelText) {
                            label = labelText
                        }
                    }
                    
                    textsToTranslate.push({
                        label,
                        sourceText,
                        originalText,
                        itemId: itemId || sourceText.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50),
                        key: key || label.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                        elements
                    })
                    
                    console.log('[AI Translate] Added from fallback:', label)
                }
            })
        }
    }

    if (textsToTranslate.length === 0) {
        progressDialogInstance.dialog('close')
        RED.notify('No texts found to translate', 'warning')
        return
    }

    // Process translations
    let completed = 0
    let errors = 0
    const total = textsToTranslate.length * targetLanguages.length

    // Update progress function
    function updateProgress () {
        const percentage = Math.round((completed / total) * 100)
        progressFill.css('width', percentage + '%')
        progressText.text(`Translating... ${completed}/${total} (${percentage}%)`)
    }

    // Process translations with staggered delays to avoid rate limits
    let requestDelay = 0
    const delayIncrement = provider === 'anthropic' ? 2000 : 200 // 2s for Claude, 200ms for OpenAI

    textsToTranslate.forEach(item => {
        targetLanguages.forEach(targetLang => {
            // Stagger requests to avoid rate limits
            setTimeout(() => {
                translateWithAI(item.sourceText, sourceLanguage, targetLang, provider, apiKey)
                    .then(translatedText => {
                        // Update the translation field using data attributes
                        let targetInput = null
                        
                        // First try to use the elements collection if available
                        if (item.elements && item.elements[targetLang]) {
                            targetInput = item.elements[targetLang]
                        } else {
                            // Fallback: find by data attributes
                            targetInput = $(`[data-item-id="${item.itemId}"][data-lang="${targetLang}"]`)
                            
                            // If not found, try to find in the translations tab
                            if (!targetInput.length) {
                                const translationsTab = $('#dashboard-2-tab-translations-content, #translations-list').first()
                                targetInput = translationsTab.find(`[data-item-id="${item.itemId}"][data-lang="${targetLang}"]`)
                            }
                        }
                        
                        if (targetInput && targetInput.length) {
                            console.log(`[AI Translate] Updating ${item.label} [${targetLang}]:`, translatedText)
                            targetInput.val(translatedText).trigger('change')
                            
                            // Ensure data attributes are set
                            if (!targetInput.attr('data-lang')) {
                                targetInput.attr('data-lang', targetLang)
                            }
                            if (!targetInput.attr('data-item-id')) {
                                targetInput.attr('data-item-id', item.itemId)
                            }
                            if (!targetInput.attr('data-key')) {
                                targetInput.attr('data-key', item.key)
                            }
                        } else {
                            console.error(`[AI Translate] Could not find input for ${item.label} [${targetLang}] with item-id: ${item.itemId}`)
                        }

                        completed++
                        updateProgress()

                        if (completed + errors === total) {
                            progressDialogInstance.dialog('close')
                            if (errors === 0) {
                                RED.notify(`AI translation completed successfully! Translated ${completed} texts.`, 'success')
                            } else {
                                RED.notify(`Translation completed with ${errors} errors. Successfully translated ${completed} texts.`, 'warning')
                            }
                            RED.nodes.dirty(true)
                        }
                        return translatedText
                    })
                    .catch(error => {
                        errors++
                        console.error('Translation error:', error)

                        if (completed + errors === total) {
                            progressDialogInstance.dialog('close')
                            if (errors === total) {
                                RED.notify(`Translation failed. Error: ${error.message}`, 'error')
                            } else {
                                RED.notify(`Translation completed with ${errors} errors. Successfully translated ${completed} texts.`, 'warning')
                            }
                        }
                    })
            }, requestDelay)
            requestDelay += delayIncrement // Increment delay for next request
        })
    })
}

// AI Translation API call
async function translateWithAI (text, sourceLang, targetLang, provider, apiKey) {
    // Use the Node-RED endpoint to avoid CORS issues
    try {
        const response = await fetch('dashboard/ai-translate/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text,
                sourceLang,
                targetLang,
                provider,
                apiKey
            })
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || 'Translation failed')
        }

        const data = await response.json()
        return data.translatedText
    } catch (error) {
        console.error('Translation error:', error)
        throw error
    }
}
