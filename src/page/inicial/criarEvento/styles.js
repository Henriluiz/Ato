import { StyleSheet } from 'react-native';


export default StyleSheet.create({

    // ==========================================
    // CONTAINER
    // ==========================================

    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },


    scrollContent: {
        paddingHorizontal: 22,
        paddingBottom: 120,
    },


    // ==========================================
    // HEADER
    // ==========================================

    header: {
        height: 82,
        marginTop: 10,

        paddingHorizontal: 22,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },


    title: {
        fontSize: 23,
        fontWeight: '700',
        color: '#172033',
        letterSpacing: -0.4,
    },


    closeButton: {
        width: 36,
        height: 36,

        borderRadius: 18,

        borderWidth: 1,
        borderColor: '#E1E5EB',

        backgroundColor: '#FFFFFF',

        alignItems: 'center',
        justifyContent: 'center',
    },


    // ==========================================
    // TEXTOS
    // ==========================================

    sectionTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#172033',

        marginBottom: 9,
    },


    repeatTitle: {
        marginTop: 21,
    },


    endTitle: {
        marginTop: 22,
    },


    tagsTitle: {
        marginTop: 21,
    },


    // ==========================================
    // INPUT
    // ==========================================

    input: {
        height: 47,

        borderRadius: 12,

        borderWidth: 1,
        borderColor: '#E0E4EA',

        backgroundColor: '#FFFFFF',

        paddingHorizontal: 15,

        fontSize: 14,

    },


    // ==========================================
    // DIAS
    // ==========================================

    daysRow: {
        flexDirection: 'row',

        justifyContent: 'space-between',

        gap: 7,
    },


    dayButton: {
        height: 27,

        flex: 1,

        borderRadius: 14,

        borderWidth: 1,
        borderColor: '#DDE2E8',

        backgroundColor: '#FFFFFF',

        alignItems: 'center',
        justifyContent: 'center',
    },


    dayButtonSelected: {
        backgroundColor: '#5146E5',
        borderColor: '#5146E5',
    },


    dayText: {
        fontSize: 13,

        fontWeight: '500',

        color: '#172033',
    },


    dayTextSelected: {
        color: '#FFFFFF',
    },


    // ==========================================
    // PRESETS
    // ==========================================

    presetsRow: {
        flexDirection: 'row',

        alignItems: 'center',

        gap: 8,

        marginTop: 12,
    },


    presetButton: {
        height: 34,
        paddingHorizontal: 13,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#E0E4EA',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },


    presetSelected: {
        borderColor: '#5146E5',
        backgroundColor: '#F7F6FF',
    },


    presetText: {
        fontSize: 13,

        color: '#4B5563',
    },


    presetTextSelected: {
        color: '#5146E5',
    },


    // ==========================================
    // DATA
    // ==========================================

    endDateRow: {
        flexDirection: 'row',

        alignItems: 'center',

        width: '100%',
    },


    dateInput: {
        height: 47,

        flex: 1,

        borderRadius: 11,

        borderWidth: 1,

        borderColor: '#E4E7EC',

        backgroundColor: '#FFFFFF',

        flexDirection: 'row',

        alignItems: 'center',

        paddingHorizontal: 15,

        gap: 10,
    },


    dateInputDisabled: {
        backgroundColor: '#F1F2F4',
        borderColor: '#E9EBEF',
    },


    dateText: {
        fontSize: 13,
        color: '#667085',
    },


    dateTextDisabled: {
        color: '#C1C6D0',
    },


    semFimText: {
        fontSize: 13,

        color: '#172033',

        marginLeft: 11,
        marginRight: 5,
    },


    switch: {
        transform: [
            {
                scaleX: 0.88,
            },
            {
                scaleY: 0.88,
            },
        ],
    },


    // ==========================================
    // TAG INPUT
    // ==========================================

    tagInputRow: {
        flexDirection: 'row',

        alignItems: 'center',

        gap: 12,
    },


    tagInput: {
        height: 47,
        flex: 1,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E4EA',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 15,
        fontSize: 13,
    },


    addTagButton: {
        width: 47,
        height: 47,

        borderRadius: 11,

        backgroundColor: '#5146E5',

        alignItems: 'center',
        justifyContent: 'center',
    },


    // ==========================================
    // TAGS
    // ==========================================

    tagsContainer: {
        flexDirection: 'row',

        flexWrap: 'wrap',

        gap: 7,

        marginTop: 12,
    },


    tag: {
        height: 30,

        paddingHorizontal: 11,

        borderRadius: 7,

        backgroundColor: '#EEF1FF',

        flexDirection: 'row',

        alignItems: 'center',

        gap: 6,
    },


    tagText: {
        fontSize: 12,

        color: '#5146E5',

        fontWeight: '500',
    },


    // ==========================================
    // FOOTER
    // ==========================================

    footer: {
        position: 'absolute',

        left: 22,
        right: 22,
        bottom: 27,
    },


    createButton: {
        height: 52,

        borderRadius: 11,

        backgroundColor: '#5146E5',

        alignItems: 'center',
        justifyContent: 'center',
    },


    createButtonText: {
        color: '#FFFFFF',

        fontSize: 15,

        fontWeight: '500',
    },

});