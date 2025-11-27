<template>
  <div ref="pickerRef" class="relative">
    <!-- Trigger Button -->
    <div
      @click.stop="togglePicker"
      class="px-2 py-1 text-xs border border-gray-300 rounded cursor-pointer hover:border-gray-400 bg-white"
    >
      <span v-if="displayValue" class="text-gray-900">{{ displayValue }}</span>
      <span v-else class="text-gray-400">{{ placeholder }}</span>
    </div>

    <!-- Calendar Dropdown - Portal to body -->
    <teleport to="body">
      <div
        ref="calendarRef"
        v-if="showPicker"
        class="calendar-popup fixed z-[10000] bg-white border border-gray-300 rounded-lg shadow-lg p-4"
        :style="calendarPosition"
        @click.stop
      >
      <div class="flex gap-4">
        <!-- First Month -->
        <div class="flex-1">
          <div class="flex items-center justify-between mb-3">
            <button
              @click="previousMonth"
              class="p-1 hover:bg-gray-100 rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <span class="text-sm font-semibold text-gray-900">{{ getMonthYear(currentMonth) }}</span>
            <div class="w-6"></div>
          </div>
          <div class="calendar-grid">
            <div v-for="day in weekDays" :key="day" class="calendar-header">{{ day }}</div>
            <div
              v-for="date in getCalendarDates(currentMonth)"
              :key="date.key"
              @click="selectDate(date)"
              class="calendar-day"
              :class="{
                'other-month': !date.isCurrentMonth,
                'selected': isSelected(date),
                'in-range': isInRange(date),
                'range-start': isRangeStart(date),
                'range-end': isRangeEnd(date),
                'today': isToday(date)
              }"
            >
              {{ date.day }}
            </div>
          </div>
        </div>

        <!-- Second Month -->
        <div class="flex-1">
          <div class="flex items-center justify-between mb-3">
            <div class="w-6"></div>
            <span class="text-sm font-semibold text-gray-900">{{ getMonthYear(nextMonth) }}</span>
            <button
              @click="nextMonthHandler"
              class="p-1 hover:bg-gray-100 rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
          <div class="calendar-grid">
            <div v-for="day in weekDays" :key="day" class="calendar-header">{{ day }}</div>
            <div
              v-for="date in getCalendarDates(nextMonth)"
              :key="date.key"
              @click="selectDate(date)"
              class="calendar-day"
              :class="{
                'other-month': !date.isCurrentMonth,
                'selected': isSelected(date),
                'in-range': isInRange(date),
                'range-start': isRangeStart(date),
                'range-end': isRangeEnd(date),
                'today': isToday(date)
              }"
            >
              {{ date.day }}
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200">
        <button
          @click="clearDates"
          class="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
        >
          Clear
        </button>
        <button
          @click="applyAndClose"
          class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Apply
        </button>
      </div>
      </div>

      <!-- Backdrop to close picker -->
      <div
        v-if="showPicker"
        @click="closePicker"
        class="fixed inset-0 z-[9998]"
        style="background-color: transparent; backdrop-filter: blur(0px);"
      ></div>
    </teleport>
  </div>
</template>

<script>
export default {
  name: 'DateRangePicker',
  props: {
    startDate: {
      type: String,
      default: null
    },
    endDate: {
      type: String,
      default: null
    },
    placeholder: {
      type: String,
      default: 'Select date range'
    }
  },
  data() {
    return {
      showPicker: false,
      currentMonth: new Date(),
      selectedStart: this.startDate ? new Date(this.startDate) : null,
      selectedEnd: this.endDate ? new Date(this.endDate) : null,
      tempStart: null,
      tempEnd: null,
      weekDays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      calendarPosition: {}
    }
  },
  computed: {
    nextMonth() {
      const next = new Date(this.currentMonth)
      next.setMonth(next.getMonth() + 1)
      return next
    },
    displayValue() {
      if (this.selectedStart && this.selectedEnd) {
        return `${this.formatDate(this.selectedStart)} - ${this.formatDate(this.selectedEnd)}`
      } else if (this.selectedStart) {
        return this.formatDate(this.selectedStart)
      }
      return ''
    }
  },
  methods: {
    togglePicker() {
      this.showPicker = !this.showPicker
      if (this.showPicker) {
        this.tempStart = this.selectedStart
        this.tempEnd = this.selectedEnd
        this.$nextTick(() => {
          this.positionCalendar()
        })
      }
    },
    positionCalendar() {
      if (!this.$refs.pickerRef) return

      const rect = this.$refs.pickerRef.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const calendarHeight = 400 // approximate height

      let top = rect.bottom + 5
      let left = rect.left

      // Check if calendar would go below viewport
      if (top + calendarHeight > viewportHeight) {
        top = rect.top - calendarHeight - 5
      }

      // Check if calendar would go beyond right viewport edge
      if (left + 550 > window.innerWidth) {
        left = window.innerWidth - 570
      }

      // Ensure it doesn't go beyond left edge
      if (left < 10) {
        left = 10
      }

      this.calendarPosition = {
        top: `${top}px`,
        left: `${left}px`,
        minWidth: '550px'
      }
    },
    closePicker() {
      this.showPicker = false
      this.selectedStart = this.tempStart
      this.selectedEnd = this.tempEnd
      this.emitChange()
    },
    applyAndClose() {
      this.showPicker = false
      this.selectedStart = this.tempStart
      this.selectedEnd = this.tempEnd
      this.emitChange()
      // Emit event to close parent filter modal
      this.$emit('close-filter')
    },
    clearDates() {
      this.tempStart = null
      this.tempEnd = null
      this.selectedStart = null
      this.selectedEnd = null
      this.emitChange()
    },
    previousMonth() {
      const prev = new Date(this.currentMonth)
      prev.setMonth(prev.getMonth() - 1)
      this.currentMonth = prev
    },
    nextMonthHandler() {
      const next = new Date(this.currentMonth)
      next.setMonth(next.getMonth() + 1)
      this.currentMonth = next
    },
    getMonthYear(date) {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      return `${months[date.getMonth()]} ${date.getFullYear()}`
    },
    getCalendarDates(monthDate) {
      const year = monthDate.getFullYear()
      const month = monthDate.getMonth()

      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const startingDayOfWeek = firstDay.getDay()
      const daysInMonth = lastDay.getDate()

      const dates = []

      // Previous month days
      const prevMonth = new Date(year, month, 0)
      const daysInPrevMonth = prevMonth.getDate()
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        dates.push({
          day: daysInPrevMonth - i,
          date: new Date(year, month - 1, daysInPrevMonth - i),
          isCurrentMonth: false,
          key: `prev-${daysInPrevMonth - i}`
        })
      }

      // Current month days
      for (let i = 1; i <= daysInMonth; i++) {
        dates.push({
          day: i,
          date: new Date(year, month, i),
          isCurrentMonth: true,
          key: `current-${i}`
        })
      }

      // Next month days
      const remainingDays = 42 - dates.length
      for (let i = 1; i <= remainingDays; i++) {
        dates.push({
          day: i,
          date: new Date(year, month + 1, i),
          isCurrentMonth: false,
          key: `next-${i}`
        })
      }

      return dates
    },
    selectDate(dateObj) {
      if (!dateObj.isCurrentMonth) return

      const selectedDate = dateObj.date

      if (!this.tempStart || (this.tempStart && this.tempEnd)) {
        // Start new selection
        this.tempStart = selectedDate
        this.tempEnd = null
      } else if (this.tempStart && !this.tempEnd) {
        // Complete the range
        if (selectedDate < this.tempStart) {
          this.tempEnd = this.tempStart
          this.tempStart = selectedDate
        } else {
          this.tempEnd = selectedDate
        }
      }
    },
    isSelected(dateObj) {
      if (!dateObj.isCurrentMonth) return false
      const date = dateObj.date
      return (this.tempStart && this.isSameDay(date, this.tempStart)) ||
             (this.tempEnd && this.isSameDay(date, this.tempEnd))
    },
    isInRange(dateObj) {
      if (!dateObj.isCurrentMonth || !this.tempStart || !this.tempEnd) return false
      const date = dateObj.date
      return date > this.tempStart && date < this.tempEnd
    },
    isRangeStart(dateObj) {
      if (!dateObj.isCurrentMonth || !this.tempStart) return false
      return this.isSameDay(dateObj.date, this.tempStart)
    },
    isRangeEnd(dateObj) {
      if (!dateObj.isCurrentMonth || !this.tempEnd) return false
      return this.isSameDay(dateObj.date, this.tempEnd)
    },
    isToday(dateObj) {
      return this.isSameDay(dateObj.date, new Date())
    },
    isSameDay(date1, date2) {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate()
    },
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    handleResize() {
      if (this.showPicker) {
        this.positionCalendar()
      }
    },
    emitChange() {
      this.$emit('update:startDate', this.selectedStart ? this.formatDate(this.selectedStart) : null)
      this.$emit('update:endDate', this.selectedEnd ? this.formatDate(this.selectedEnd) : null)
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  watch: {
    startDate(newVal) {
      this.selectedStart = newVal ? new Date(newVal) : null
      this.tempStart = this.selectedStart
    },
    endDate(newVal) {
      this.selectedEnd = newVal ? new Date(newVal) : null
      this.tempEnd = this.selectedEnd
    }
  }
}
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.calendar-header {
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  padding: 4px;
}

.calendar-day {
  text-align: center;
  padding: 6px;
  font-size: 13px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.calendar-day:hover {
  background-color: #f3f4f6;
}

.calendar-day.other-month {
  color: #d1d5db;
  cursor: default;
}

.calendar-day.other-month:hover {
  background-color: transparent;
}

.calendar-day.today {
  font-weight: 600;
  color: #2563eb;
}

.calendar-day.selected,
.calendar-day.range-start,
.calendar-day.range-end {
  background-color: #1f2937;
  color: white;
  font-weight: 600;
}

.calendar-day.in-range {
  background-color: #e5e7eb;
  color: #1f2937;
}

.calendar-day.range-start {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.calendar-day.range-end {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.calendar-popup {
  pointer-events: auto !important;
}

.calendar-popup * {
  pointer-events: auto !important;
}
</style>
