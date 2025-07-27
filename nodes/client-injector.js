/* global RED, $, showAITranslateDialog */

(function () {
    console.log('[AI Translate] Client-side injector loaded')

    let injected = false
    let checkInterval = null

    // Function to add data-lang attributes to inputs
    function enhanceTranslationFields() {
        console.log('[AI Translate] Enhancing translation fields...')
        
        const translationsTab = $('#dashboard-2-tab-translations-content, #translations-list')
        
        // Method 1: Look for the complete translation field structure
        translationsTab.find('div').each(function() {
            const container = $(this)
            
            // Check if this is a translation field container
            const firstDiv = container.find('> div').first()
            if (!firstDiv.length) return
            
            // Check for bold label (field name)
            const isBold = firstDiv.css('font-weight') === 'bold' || firstDiv.find('b').length > 0
            if (!isBold) return
            
            const fieldLabel = firstDiv.text().replace(':', '').trim()
            if (!fieldLabel) return
            
            // Get the original/readonly input
            const originalInput = container.find('input[readonly], textarea[readonly]').first()
            const originalText = originalInput.val()
            
            if (originalText && originalText.trim()) {
                // Generate consistent IDs
                const itemId = originalText.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50)
                const key = fieldLabel.toLowerCase().replace(/[^a-z0-9]/g, '_')
                
                // Add attributes to original input
                if (originalInput.length) {
                    if (!originalInput.attr('data-item-id')) originalInput.attr('data-item-id', itemId)
                    if (!originalInput.attr('data-key')) originalInput.attr('data-key', key)
                    if (!originalInput.attr('data-lang')) originalInput.attr('data-lang', 'original')
                }
                
                // Process each language input
                container.find('> div').each(function() {
                    const div = $(this)
                    const labelElement = div.find('label').first()
                    
                    if (labelElement.length > 0) {
                        const langText = labelElement.text()
                        let langCode = null
                        
                        // Extract language code
                        if (langText.toLowerCase().includes('english')) langCode = 'en'
                        else if (langText.toLowerCase().includes('français')) langCode = 'fr'
                        else if (langText.toLowerCase().includes('italiano')) langCode = 'it'
                        else if (langText.toLowerCase().includes('español') || langText.toLowerCase().includes('espanol')) langCode = 'es'
                        else if (langText.toLowerCase().includes('deutsch')) langCode = 'de'
                        
                        if (langCode) {
                            const input = div.find('input[type="text"], textarea').first()
                            if (input.length) {
                                if (!input.attr('data-lang')) input.attr('data-lang', langCode)
                                if (!input.attr('data-item-id')) input.attr('data-item-id', itemId)
                                if (!input.attr('data-key')) input.attr('data-key', key)
                                console.log(`[AI Translate] Enhanced field: ${fieldLabel} [${langCode}]`)
                            }
                        }
                    }
                })
            }
        })
        
        // Method 2: Fallback for .langDiv structure
        $('#dashboard-2-tab-translations-content').find('.langDiv').each(function() {
            const langDiv = $(this)
            const langCode = langDiv.find('.langLabel').text().match(/\(([^)]+)\)/)?.[1]
            
            if (langCode) {
                // Add data-lang attribute to inputs and textareas
                langDiv.find('input[type="text"], textarea').each(function() {
                    const input = $(this)
                    if (!input.attr('data-lang')) {
                        input.attr('data-lang', langCode)
                        console.log('[AI Translate] Added data-lang attribute:', langCode)
                    }
                })
            }
        })
    }

    // Function to inject the translation button
    function injectTranslationButton () {
        if (injected) return

        console.log('[AI Translate] Attempting to inject button...')

        // Check if we're in the ui_base configuration dialog
        const refreshBtn = $('#refresh-translations-btn')
        if (refreshBtn.length > 0 && $('#ai-translate-btn').length === 0) {
            console.log('[AI Translate] Found refresh button, injecting AI Translate button...')

            const aiButton = $('<button id="ai-translate-btn" class="red-ui-button red-ui-button-small" title="Translate using AI">' +
                '<i class="fa fa-magic"></i> AI Translate' +
                '</button>')

            refreshBtn.before(aiButton)
            refreshBtn.before(' ') // Add space between buttons

            // Add click handler
            aiButton.on('click', function (e) {
                e.preventDefault()
                e.stopPropagation()
                console.log('[AI Translate] Button clicked')
                
                // Enhance fields before showing dialog
                enhanceTranslationFields()

                if (window.showAITranslateDialog) {
                    window.showAITranslateDialog()
                } else {
                    console.log('[AI Translate] Loading dialog script...')
                    // Load the dialog function if not already loaded
                    $.getScript('dashboard-2-ai-translate/dialog.js')
                        .done(function () {
                            console.log('[AI Translate] Dialog script loaded')
                            if (window.showAITranslateDialog) {
                                window.showAITranslateDialog()
                            }
                        })
                        .fail(function (jqxhr, settings, exception) {
                            console.error('[AI Translate] Failed to load dialog script:', exception)
                        })
                }
                return false
            })

            injected = true
            console.log('[AI Translate] Button added successfully')
            
            // Enhance fields when button is injected
            setTimeout(enhanceTranslationFields, 500)

            // Stop checking once injected
            if (checkInterval) {
                clearInterval(checkInterval)
                checkInterval = null
            }
        }
    }

    // Watch for dialog opening
    function watchForDialog () {
        // Check periodically for the refresh button
        checkInterval = setInterval(function () {
            injectTranslationButton()
        }, 500)

        // Also listen for dialog open events
        $(document).on('dialogopen', function (event, ui) {
            console.log('[AI Translate] Dialog opened, checking for translation interface...')
            setTimeout(injectTranslationButton, 100)
            setTimeout(injectTranslationButton, 500)
            setTimeout(injectTranslationButton, 1000)
        })

        // Listen for tab changes in the dashboard config dialog
        $(document).on('click', '.red-ui-tab-label', function () {
            const tabText = $(this).text()
            if (tabText && tabText.toLowerCase().includes('translation')) {
                console.log('[AI Translate] Translation tab clicked')
                setTimeout(injectTranslationButton, 100)
                setTimeout(injectTranslationButton, 500)
            }
        })
    }

    // Start watching when document is ready
    $(document).ready(function () {
        console.log('[AI Translate] Document ready, starting injection watcher...')
        watchForDialog()
    })

    // Also try on RED events
    if (window.RED && window.RED.events) {
        RED.events.on('editor:open', function () {
            console.log('[AI Translate] Editor opened')
            setTimeout(injectTranslationButton, 500)
            setTimeout(injectTranslationButton, 1000)
        })
    }
})()