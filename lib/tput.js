
// Ostalo je skoro nista.

// See: ~/ncurses/ncurses/tinfo/lib_tputs.c
Tput.prototype._print = function(code, print, done) {
  var xon = !this.bools.needs_xon_xoff || this.bools.xon_xoff;

  print = print || write;
  done = done || noop;

  if (!this.padding) {
    print(code);
    return done();
  }

  var parts = code.split(/(?=\$<[\d.]+[*\/]{0,2}>)/)
    , i = 0;

  (function next() {
    if (i === parts.length) {
      return done();
    }

    var part = parts[i++]
      , padding = /^\$<([\d.]+)([*\/]{0,2})>/.exec(part)
      , amount
      , suffix;
      // , affect;

    if (!padding) {
      print(part);
      return next();
    }

    part = part.substring(padding[0].length);
    amount = +padding[1];
    suffix = padding[2];

    // A `/'  suffix indicates  that  the  padding  is  mandatory and forces a
    // delay of the given number of milliseconds even on devices for which xon
    // is present to indicate flow control.
    if (xon && !~suffix.indexOf('/')) {
      print(part);
      return next();
    }

    // A `*' indicates that the padding required is proportional to the number
    // of lines affected by the operation, and  the amount  given  is the
    // per-affected-unit padding required.  (In the case of insert character,
    // the factor is still the number of lines affected.) Normally, padding is
    // advisory if the device has the xon capability; it is used for cost
    // computation but does not trigger delays.
    if (~suffix.indexOf('*')) {
      // XXX Disable this for now.
      amount = amount;
      // if (affect = /\x1b\[(\d+)[LM]/.exec(part)) {
      //   amount *= +affect[1];
      // }
      // The above is a huge workaround. In reality, we need to compile
      // `_print` into the string functions and check the cap name and
      // params.
      // if (cap === 'insert_line' || cap === 'delete_line') {
      //   amount *= params[0];
      // }
      // if (cap === 'clear_screen') {
      //   amount *= process.stdout.rows;
      // }
    }

    return setTimeout(function() {
      print(part);
      return next();
    }, amount);
  })();
};




// A small helper function if we want
// to easily output text with setTimeouts.
Tput.print = function() {
  var fake = {
    padding: true,
    bools: { needs_xon_xoff: true, xon_xoff: false }
  };
  return Tput.prototype._print.apply(fake, arguments);
};

Tput.prototype.GetConsoleCP = function() {
  var ccp;

  if (process.platform !== 'win32') {
    return -1;
  }

  // Allow unicode on all windows consoles for now:
  if (+process.env.NCURSES_NO_WINDOWS_UNICODE !== 1) {
    return 65001;
  }

  // cp.execSync('chcp 65001', { stdio: 'ignore', timeout: 1500 });

  try {
    // Produces something like: 'Active code page: 437\n\n'
    ccp = cp.execFileSync(process.env.WINDIR + '\\system32\\chcp.com', [], {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'ascii',
      timeout: 1500
    });
    // ccp = cp.execSync('chcp', {
    //   stdio: ['ignore', 'pipe', 'ignore'],
    //   encoding: 'ascii',
    //   timeout: 1500
    // });
  } catch (e) {
    ;
  }

  ccp = /\d+/.exec(ccp);

  if (!ccp) {
    return -1;
  }

  ccp = +ccp[0];

  return ccp;
};
