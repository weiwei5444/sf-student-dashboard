/**
 * Dashboard renderer
 *
 * Implementation of Stephen Few's Student Performance Dashboard with Mike Bostock's d3.js library
 *
 * Copyright Robert Monfera
 * Copyright on the design of the Student Performance Dashboard: Stephen Few
 */

var duration = 200
var UNICODE_UP_DOWN_ARROW = '\u21d5'

function renderPetiteHeader(root, vm) {
    bind(root, 'petiteColumnHeader')
        .entered
        .attr('transform', translateY(-25))
    bind(root['petiteColumnHeader'], 'group', 'g', vm)
    bind(root['petiteColumnHeader']['group'], 'headerText', 'text')
        .text(function(d) {return sortedByThis('key', d.key) ? d.key + '' + UNICODE_UP_DOWN_ARROW : d.key})
        .entered
        .classed('interactive', property('interactive'))
        .on('mousedown', function(d) {setPetiteHeaderTableSortOrder(d.key, d)})
        .on('mouseup', resetTableSortOrder)
        .attr('x', value)
        .attr('opacity', 1)
}

var s = calculateScales()

function render() {


    /**
     * Root
     */

    var svgWidth = 1280
    var svgHeight = 1025

    root.attr({viewBox: [0, 0, svgWidth, svgHeight].join(' ')})

    var dashboard = bind(root, 'dashboard', 'g', [dashboardData])
    dashboard.entered
        .attr('transform', translateY(38))


    /**
     * Headers
     */

    function renderGroupHolder(selection, className, x, y, y2) {

        var group = bind(selection, className)
        group
            .entered
            .attr('transform', translate(x, y))

        var fullClassName = className + '_contents'

        bind(group, fullClassName)
            .entered
            .classed('groupContents', true)

        return {
            group: group[fullClassName],
            className: className
        }
    }


    /**
     * Top header rows
     */

    var topGroups = bind(dashboard, 'topGroups')

    var assignmentScoresGroupX = 200
    var classAssessmentGroupX = 360
    var namesGroup = renderGroupHolder(topGroups, 'namesGroup', 0, 0)
    var assignmentScoresGroup = renderGroupHolder(topGroups, 'assignmentScoresGroup', classAssessmentGroupX - 230, 0)
    var assessmentScoresGroup = renderGroupHolder(topGroups, 'assessmentScoresGroup', classAssessmentGroupX, 0)
    var assignmentScoresAggregateGroup = renderGroupHolder(topGroups, 'assignmentScoresAggregateGroup', assignmentScoresGroupX, 866)


    /**
     * Legends
     */

    renderPetiteHeader(namesGroup.group, [
        {key: 'Name', value: 0, interactive: true}
    ])


    renderPetiteHeader(assignmentScoresGroup.group, [
        {key: 'YTD', value: -90, interactive: true},
        {key: 'Spread', value: -21, interactive: true}
    ])

    renderPetiteHeader(assessmentScoresGroup.group, [
        {key: 'Last 5', value: 12, interactive: true}
    ])


    /**
     * Rows
     */

    var rowsRoot = namesGroup.group
    var rowSelection = bind(rowsRoot, 'row', 'g', makeRowData)
    var row = rowSelection.entered
    function rowTransform(d, i) {return translateY(i * s.rowPitch)()}

    row
        .attr('transform', rowTransform)
    rowSelection
        .transition().duration(duration * 4)
        .attr('transform', rowTransform)

    bind(rowSelection, 'rowBackground', 'rect')
        .attr('fill-opacity', function(d) {return dashboardSettings.table.studentSelection.selectedStudents[d.key] ? 0.025 : 0})
        .entered
        .attr({
            width: 450,
            height: s.rowPitch,
            y: - s.rowPitch / 2
        })

    bind(row, 'nameCell')
        .entered
        .classed('namesGroup', true)
    bind(row['nameCell'], 'nameCellText', 'text')
        .entered
        .text(key)
        .attr('y', '0.5em')

    var assignmentBandLine = bandLine()
        .bands(s.assignmentBands)
        .valueAccessor(property('assignmentScores'))
        .pointStyleAccessor(s.assignmentOutlierScale)
        .xScaleOfBandLine(s.assignmentScoreTemporalScale)
        .xScaleOfSparkStrip(s.assignmentScoreTemporalScale2)
        .rScaleOfBandLine(s.bandLinePointRScale)
        .rScaleOfSparkStrip(s.sparkStripPointRScale)
        .yRange(s.assignmentScoreVerticalScale.range())
        .yAxis(false)

    bind(row, 'assignmentScoresCell')
        .entered
        .attr('transform', translateX(assignmentScoresGroupX))
    row['assignmentScoresCell'].entered.call(assignmentBandLine.renderBandLine)

    bind(row, 'assignmentScoresVerticalCell')
        .entered
        .attr('transform', translateX(assignmentScoresGroupX + 86))

    row['assignmentScoresVerticalCell']
        .entered
        .call(assignmentBandLine.renderSparkStrip)

    bind(row, 'assessmentScoresCell')
        .entered
        .attr('transform', translateX(classAssessmentGroupX))
    var assessmentBandLine = bandLine()
            .bands(s.assessmentBands)
            .valueAccessor(property('standardScores'))
            .pointStyleAccessor(s.assessmentOutlierScale)
            .xScaleOfBandLine(s.assessmentScoreTemporalScale)
            .rScaleOfBandLine(s.bandLinePointRScale)
            .yRange(s.assessmentScoreScale.range())
            .yAxis(false)

    row['assessmentScoresCell'].entered.call(assessmentBandLine.renderBandLine)

    ;(function renderAssignmentScoresAggregates(root) {
        bind(root, 'assignmentAggregateMetrics', 'g', function(d) {
            var students = keptStudentData(d)
            var scores = pluck('assignmentScores')(students)
            var totalsRow = {
                key: 'totalsRow',
                assignmentScores: [
                    d3.mean(pluck(0)(scores).filter(identity)),
                    d3.mean(pluck(1)(scores).filter(identity)),
                    d3.mean(pluck(2)(scores).filter(identity)),
                    d3.mean(pluck(3)(scores).filter(identity)),
                    d3.mean(pluck(4)(scores).filter(identity))
                ]
            }
            return [totalsRow]
        })

        var aggregateAssignmentBandLine = bandLine()
            .bands(s.assignmentBands)
            .valueAccessor(property('assignmentScores'))
            .pointStyleAccessor(s.assignmentOutlierScale)
            .xScaleOfBandLine(s.assignmentScoreTemporalScale)
            .rScaleOfBandLine(s.bandLinePointRScale)
            .yRange(s.assignmentScoreVerticalScaleLarge.range())
            .yAxis(d3.svg.axis().orient('right').ticks(4).tickFormat(d3.format('%')))
        root['assignmentAggregateMetrics'].call(aggregateAssignmentBandLine.renderBandLine)

        bind(row, 'rowCaptureZone', 'rect')
            .on(rowInteractions)
            .attr({
                width: 1328 - 48,
                height: s.rowPitch,
                x: -46,
                y: - s.rowPitch / 2
            })

    })(assignmentScoresAggregateGroup.group)
}