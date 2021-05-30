function ScrollableBox(options) {

    // ...done...

  if (scrollbar) {

    // ......

    // Allow controlling of the scrollbar via the mouse:
    if (options.mouse) {
      this.on('mousedown', function(data) {
        if (self._scrollingBar) {
          // Do not allow dragging on the scrollbar:
          delete self.screen._dragging;
          delete self._drag;
          return;
        }
        var x = data.x - self.aleft;
        var y = data.y - self.atop;
        if (x === self.width - self.iright - 1) {
          // Do not allow dragging on the scrollbar:
          delete self.screen._dragging;
          delete self._drag;
          var perc = (y - self.itop) / (self.height - self.iheight);
          self.setScrollPerc(perc * 100 | 0);
          self.screen.render();
          var smd, smu;
          self._scrollingBar = true;
          self.onScreenEvent('mousedown', smd = function(data) {
            var y = data.y - self.atop;
            var perc = y / self.height;
            self.setScrollPerc(perc * 100 | 0);
            self.screen.render();
          });
          // If mouseup occurs out of the window, no mouseup event fires, and
          // scrollbar will drag again on mousedown until another mouseup
          // occurs.
          self.onScreenEvent('mouseup', smu = function() {
            self._scrollingBar = false;
            self.removeScreenEvent('mousedown', smd);
            self.removeScreenEvent('mouseup', smu);
          });
        }
      });
    }
  }

  if (options.mouse) {
    this.on('wheeldown', function() {
      self.scroll(self.height / 2 | 0 || 1);
      self.screen.render();
    });
    this.on('wheelup', function() {
      self.scroll(-(self.height / 2 | 0) || -1);
      self.screen.render();
    });
  }

  /// done
}

